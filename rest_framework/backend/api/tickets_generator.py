from django.apps import apps
from django.db import transaction

PREFIXES = {
    "DEPOT": "D",
    "RETRAIT": "R",
    "ASSISTANCE": "A",
}


@transaction.atomic
def generate_ticket_code(service_type):
    """
    Génère automatiquement un code de ticket.

    Exemples :
    D001
    D002
    R001
    A015
    """

    Ticket = apps.get_model("api", "Ticket")

    prefix = PREFIXES[service_type]

    dernier_ticket = (
        Ticket.objects
        .select_for_update()
        .filter(ticket_code__startswith=prefix)
        .order_by("-ticket_code")
        .first()
    )

    if dernier_ticket is None:
        numero = 1
    else:
        numero = int(dernier_ticket.ticket_code[1:]) + 1

    return f"{prefix}{numero:03d}"