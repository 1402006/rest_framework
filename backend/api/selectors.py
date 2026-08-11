"""
Couche "selectors" : centralise TOUTES les lectures (querysets, lookups,
calculs de lecture seule). Les vues ne construisent jamais de requête
ORM directement — elles appellent un selector.

Convention : chaque fonction prend des arguments nommés uniquement
(keyword-only, via `*`) pour rester explicite et facile à faire évoluer.
"""

from typing import Optional

from .models import Client, Guichet, Service, Ticket, User

# ---------------------------------------------------------------------------
# Service
# ---------------------------------------------------------------------------


def service_list(*, is_active: Optional[bool] = None):
    qs = Service.objects.all().order_by("service_type")
    if is_active is not None:
        qs = qs.filter(is_active=is_active)
    return qs


def service_get(*, service_id: int) -> Service:
    return Service.objects.get(pk=service_id)


# ---------------------------------------------------------------------------
# Guichet
# ---------------------------------------------------------------------------


def guichet_list(*, status: Optional[str] = None, service_id: Optional[int] = None):
    qs = Guichet.objects.all().prefetch_related("services").order_by("guichet_name")
    if status:
        qs = qs.filter(guichet_status=status)
    if service_id:
        qs = qs.filter(services__id=service_id)
    return qs.distinct()


def guichet_get(*, guichet_id: int) -> Guichet:
    return Guichet.objects.prefetch_related("services").get(pk=guichet_id)


def guichets_offering_service(*, service: Service):
    return Guichet.objects.filter(
        services=service,
        guichet_status=Guichet.Status.OPEN,
    )


def guichet_waiting_count(*, guichet: Guichet) -> int:
    return Ticket.objects.filter(
        guichet=guichet, ticket_status=Ticket.Status.WAITING
    ).count()


# ---------------------------------------------------------------------------
# Agents (User)
# ---------------------------------------------------------------------------


def agent_list(*, role: Optional[str] = "AGENT", guichet_id: Optional[int] = None):
    qs = User.objects.all().order_by("username")
    if role:
        qs = qs.filter(role=role)
    if guichet_id:
        qs = qs.filter(guichet_id=guichet_id)
    return qs


def agent_get(*, agent_id: int) -> User:
    return User.objects.get(pk=agent_id)


# ---------------------------------------------------------------------------
# Client
# ---------------------------------------------------------------------------


def client_list():
    return Client.objects.all().order_by("-login_date")


def client_get(*, client_id: int) -> Client:
    return Client.objects.get(pk=client_id)


# ---------------------------------------------------------------------------
# Ticket
# ---------------------------------------------------------------------------


def ticket_list(
    *,
    status: Optional[str] = None,
    guichet_id: Optional[int] = None,
    service_id: Optional[int] = None,
    date: Optional[str] = None,
):
    qs = Ticket.objects.select_related("service", "guichet", "owner", "called_by")
    if status:
        qs = qs.filter(ticket_status=status)
    if guichet_id:
        qs = qs.filter(guichet_id=guichet_id)
    if service_id:
        qs = qs.filter(service_id=service_id)
    if date:
        qs = qs.filter(created_at__date=date)
    return qs.order_by("created_at")


def ticket_get(*, ticket_id: int) -> Ticket:
    return Ticket.objects.select_related(
        "service", "guichet", "owner", "called_by"
    ).get(pk=ticket_id)


def ticket_get_by_code(*, ticket_code: str) -> Ticket:
    return Ticket.objects.select_related("service", "guichet", "owner").get(
        ticket_code=ticket_code
    )


def waiting_tickets_for_guichet(*, guichet: Guichet):
    """File d'attente FIFO des tickets en attente pour un guichet donné."""
    return Ticket.objects.filter(
        guichet=guichet, ticket_status=Ticket.Status.WAITING
    ).order_by("created_at")


def agent_current_ticket(*, agent: User):
    """Ticket actuellement traité (CALLED ou IN_PROGRESS) par un agent, s'il y en a un."""
    return (
        Ticket.objects.filter(
            called_by=agent,
            ticket_status__in=[Ticket.Status.CALLED, Ticket.Status.IN_PROGRESS],
        )
        .order_by("-called_at")
        .first()
    )


def queue_position(*, ticket: Ticket) -> int:
    """Position (1-indexée) du ticket dans la file d'attente de son guichet."""
    if ticket.ticket_status != Ticket.Status.WAITING:
        return 0
    return (
        Ticket.objects.filter(
            guichet=ticket.guichet,
            ticket_status=Ticket.Status.WAITING,
            created_at__lt=ticket.created_at,
        ).count()
        + 1
    )
