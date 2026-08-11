"""
Couche "services" : toute la logique métier / les écritures.

Convention : chaque fonction prend des arguments nommés uniquement
(keyword-only) et lève rest_framework.exceptions.ValidationError ou
PermissionDenied en cas de règle métier violée — ces exceptions sont
comprises nativement par DRF et transformées en réponses 400 / 403
sans code supplémentaire dans les vues.

NOTE IMPORTANTE : ce fichier suppose que le champ `Client.ticket` a
été retiré du modèle (cf. remarque sur la dépendance circulaire
Client <-> Ticket). Sans ce correctif, ticket_create() ci-dessous
échouera avec une IntegrityError.
"""

from django.db import transaction
from django.utils import timezone
from rest_framework.exceptions import PermissionDenied, ValidationError

from . import selectors
from .models import Client, Guichet, Service, Ticket, User


class QueueServiceError(ValidationError):
    """Erreur métier — DRF la transforme automatiquement en réponse 400."""


# ---------------------------------------------------------------------------
# Attribution de guichet
# ---------------------------------------------------------------------------


def pick_guichet_for_service(*, service: Service) -> Guichet:
    """
    Choisit le guichet ouvert proposant ce service avec la file
    d'attente la plus courte (répartition de charge simple).
    """
    candidates = list(selectors.guichets_offering_service(service=service))
    if not candidates:
        raise QueueServiceError(
            "Aucun guichet ouvert ne propose ce service actuellement."
        )
    return min(candidates, key=lambda g: selectors.guichet_waiting_count(guichet=g))


# ---------------------------------------------------------------------------
# Ticket : création (borne libre-service, accès public)
# ---------------------------------------------------------------------------


@transaction.atomic
def ticket_create(
    *,
    service_id: int,
    client_name: str,
    client_phone_number: int,
    client_email: str,
    numero_carte_credit: int = None,
    guichet_id: int = None,
) -> Ticket:
    try:
        service = Service.objects.get(pk=service_id, is_active=True)
    except Service.DoesNotExist:
        raise QueueServiceError("Ce service est introuvable ou désactivé.")

    guichet = (
        Guichet.objects.get(pk=guichet_id)
        if guichet_id
        else pick_guichet_for_service(service=service)
    )

    if not guichet.services.filter(pk=service.pk).exists():
        raise QueueServiceError("Ce guichet ne propose pas le service demandé.")

    if guichet.guichet_status not in (Guichet.Status.OPEN, Guichet.Status.BUSY):
        raise QueueServiceError("Ce guichet n'est pas disponible actuellement.")

    client = Client.objects.create(
        client_name=client_name,
        client_phone_number=client_phone_number,
        client_email=client_email,
        numero_carte_credit=numero_carte_credit,
    )

    ticket = Ticket.objects.create(
        guichet=guichet,
        service=service,
        owner=client,
        ticket_status=Ticket.Status.WAITING,
    )
    return ticket


# ---------------------------------------------------------------------------
# Ticket : cycle de vie côté agent
# ---------------------------------------------------------------------------


def _assert_owned_by_agent(*, ticket: Ticket, agent: User) -> None:
    is_admin = agent.is_superuser or agent.role == "ADMIN"
    if not is_admin and ticket.called_by_id != agent.id:
        raise PermissionDenied("Ce ticket n'est pas rattaché à vous.")


def call_next_ticket(*, agent: User) -> Ticket:
    if not agent.guichet_id:
        raise QueueServiceError("Vous n'êtes rattaché à aucun guichet.")

    en_cours = selectors.agent_current_ticket(agent=agent)
    if en_cours:
        raise QueueServiceError(
            f"Vous traitez déjà le ticket {en_cours.ticket_code}."
        )

    ticket = selectors.waiting_tickets_for_guichet(guichet=agent.guichet).first()
    if not ticket:
        raise QueueServiceError("Aucun ticket en attente pour votre guichet.")

    ticket.ticket_status = Ticket.Status.CALLED
    ticket.called_at = timezone.now()
    ticket.called_by = agent
    ticket.save(update_fields=["ticket_status", "called_at", "called_by"])

    if agent.guichet.guichet_status != Guichet.Status.BUSY:
        agent.guichet.guichet_status = Guichet.Status.BUSY
        agent.guichet.save(update_fields=["guichet_status"])

    return ticket


def start_ticket(*, ticket: Ticket, agent: User) -> Ticket:
    _assert_owned_by_agent(ticket=ticket, agent=agent)
    if ticket.ticket_status != Ticket.Status.CALLED:
        raise QueueServiceError("Seul un ticket appelé peut être mis en cours.")
    ticket.ticket_status = Ticket.Status.IN_PROGRESS
    ticket.save(update_fields=["ticket_status"])
    return ticket


def complete_ticket(*, ticket: Ticket, agent: User) -> Ticket:
    _assert_owned_by_agent(ticket=ticket, agent=agent)
    if ticket.ticket_status != Ticket.Status.IN_PROGRESS:
        raise QueueServiceError("Seul un ticket en cours peut être terminé.")

    ticket.ticket_status = Ticket.Status.COMPLETED
    ticket.finished_at = timezone.now()
    ticket.save(update_fields=["ticket_status", "finished_at"])

    _release_guichet_if_idle(guichet=ticket.guichet)
    return ticket


def mark_absent(*, ticket: Ticket, agent: User) -> Ticket:
    _assert_owned_by_agent(ticket=ticket, agent=agent)
    if ticket.ticket_status != Ticket.Status.CALLED:
        raise QueueServiceError("Seul un ticket appelé peut être marqué absent.")

    ticket.ticket_status = Ticket.Status.ABSENT
    ticket.finished_at = timezone.now()
    ticket.save(update_fields=["ticket_status", "finished_at"])

    _release_guichet_if_idle(guichet=ticket.guichet)
    return ticket


def cancel_ticket(*, ticket: Ticket) -> Ticket:
    if ticket.ticket_status not in (Ticket.Status.WAITING, Ticket.Status.CALLED):
        raise QueueServiceError("Ce ticket ne peut plus être annulé à ce stade.")

    ticket.ticket_status = Ticket.Status.CANCELLED
    ticket.finished_at = timezone.now()
    ticket.save(update_fields=["ticket_status", "finished_at"])

    _release_guichet_if_idle(guichet=ticket.guichet)
    return ticket


@transaction.atomic
def transfer_ticket(*, ticket: Ticket, new_guichet: Guichet, agent: User) -> Ticket:
    _assert_owned_by_agent(ticket=ticket, agent=agent)

    if new_guichet.pk == ticket.guichet_id:
        raise QueueServiceError("Le ticket est déjà rattaché à ce guichet.")
    if not new_guichet.services.filter(pk=ticket.service_id).exists():
        raise QueueServiceError("Le guichet cible ne propose pas ce service.")

    ticket.ticket_status = Ticket.Status.TRANSFERRED
    ticket.finished_at = timezone.now()
    ticket.save(update_fields=["ticket_status", "finished_at"])

    new_ticket = Ticket.objects.create(
        guichet=new_guichet,
        service=ticket.service,
        owner=ticket.owner,
        ticket_status=Ticket.Status.WAITING,
    )

    _release_guichet_if_idle(guichet=ticket.guichet)
    return new_ticket


def _release_guichet_if_idle(*, guichet: Guichet) -> None:
    """Repasse le guichet à OPEN s'il n'a plus de ticket en attente."""
    if guichet.guichet_status == Guichet.Status.BUSY:
        guichet.guichet_status = Guichet.Status.OPEN
        guichet.save(update_fields=["guichet_status"])


# ---------------------------------------------------------------------------
# Agent & Guichet : administration
# ---------------------------------------------------------------------------


def update_agent_status(*, agent: User, agent_status: str) -> User:
    agent.agent_status = agent_status
    agent.save(update_fields=["agent_status"])
    return agent


def open_guichet(*, guichet: Guichet) -> Guichet:
    guichet.guichet_status = Guichet.Status.OPEN
    guichet.save(update_fields=["guichet_status"])
    return guichet


def close_guichet(*, guichet: Guichet) -> Guichet:
    guichet.guichet_status = Guichet.Status.CLOSED
    guichet.save(update_fields=["guichet_status"])
    return guichet
