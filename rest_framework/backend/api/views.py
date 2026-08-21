"""
Vues API — exclusivement des classes génériques Django REST Framework
(generics.ListCreateAPIView, RetrieveUpdateDestroyAPIView, GenericAPIView, ...).

Les vues ne contiennent AUCUNE logique métier : elles délèguent
- les lectures aux selectors (selectors.py)
- les écritures/transitions d'état aux services (services.py)
"""

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from api import selectors
from .models import Client, Guichet, Service, Ticket, User
from api import services
from .permissions import (
    IsAdmin,
    IsAdminOrAgent,
    IsAdminOrReadOnly,
    IsAgent,
    IsAssignedToGuichet,
)
from api.serializers import (
    AgentCreateSerializer,
    AgentSerializer,
    AgentStatusUpdateSerializer,
    ClientSerializer,
    GuichetDetailSerializer,
    GuichetSerializer,
    ServiceSerializer,
    TicketCreateSerializer,
    TicketSerializer,
    TicketTransferSerializer,
)

# ---------------------------------------------------------------------------
# Service
# ---------------------------------------------------------------------------


class ServiceListCreateView(generics.ListCreateAPIView):
    """GET  /services/      -> liste (tout le monde authentifié)
    POST /services/      -> création (admin uniquement)
    """

    serializer_class = ServiceSerializer
    #permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        raw = self.request.query_params.get("is_active")
        is_active = None if raw is None else raw.lower() in ("1", "true", "yes")
        return selectors.service_list(is_active=is_active)


class ServiceDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET/PUT/PATCH/DELETE /services/<pk>/"""

    serializer_class = ServiceSerializer
    permission_classes = [IsAdminOrReadOnly]
    queryset = Service.objects.all()
    lookup_url_kwarg = "pk"


# ---------------------------------------------------------------------------
# Guichet
# ---------------------------------------------------------------------------


class GuichetListCreateView(generics.ListCreateAPIView):
    """GET /guichets/?status=&service=   POST /guichets/ (admin)"""

    permission_classes = [IsAdminOrReadOnly]

    def get_serializer_class(self):
        return GuichetSerializer if self.request.method == "POST" else GuichetDetailSerializer

    def get_queryset(self):
        params = self.request.query_params
        return selectors.guichet_list(
            status=params.get("status"), service_id=params.get("service")
        )


class GuichetDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdminOrReadOnly]
    queryset = Guichet.objects.all()
    lookup_url_kwarg = "pk"

    def get_serializer_class(self):
        if self.request.method in ("PUT", "PATCH"):
            return GuichetSerializer
        return GuichetDetailSerializer


class GuichetOpenView(generics.GenericAPIView):
    """POST /guichets/<pk>/open/ — réouvre un guichet (admin ou agent)."""

    serializer_class = GuichetDetailSerializer
    permission_classes = [IsAdminOrAgent]
    queryset = Guichet.objects.all()
    lookup_url_kwarg = "pk"

    def post(self, request, *args, **kwargs):
        guichet = services.open_guichet(guichet=self.get_object())
        return Response(self.get_serializer(guichet).data)


class GuichetCloseView(generics.GenericAPIView):
    """POST /guichets/<pk>/close/ — ferme un guichet (admin ou agent)."""

    serializer_class = GuichetDetailSerializer
    permission_classes = [IsAdminOrAgent]
    queryset = Guichet.objects.all()
    lookup_url_kwarg = "pk"

    def post(self, request, *args, **kwargs):
        guichet = services.close_guichet(guichet=self.get_object())
        return Response(self.get_serializer(guichet).data)


# ---------------------------------------------------------------------------
# Agent (User)
# ---------------------------------------------------------------------------


class AgentListCreateView(generics.ListCreateAPIView):
    """GET/POST /agents/ — réservé à l'administrateur."""

    permission_classes = [IsAdmin]

    def get_queryset(self):
        return selectors.agent_list(guichet_id=self.request.query_params.get("guichet"))

    def get_serializer_class(self):
        return AgentCreateSerializer if self.request.method == "POST" else AgentSerializer

class currentloggedUser(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = AgentSerializer
    queryset = User.objects.all()
    
class AgentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET/PUT/PATCH/DELETE /agents/<pk>/ — réservé à l'administrateur."""

    permission_classes = [IsAdmin]
    queryset = User.objects.all()
    serializer_class = AgentSerializer
    lookup_url_kwarg = "pk"


class AgentStatusUpdateView(generics.UpdateAPIView):
    """PATCH /agents/me/status/ — un agent met à jour SON PROPRE statut."""

    permission_classes = [IsAgent]
    serializer_class = AgentStatusUpdateSerializer

    def get_object(self):
        return self.request.user


# ---------------------------------------------------------------------------
# Client
# ---------------------------------------------------------------------------


class ClientListView(generics.ListAPIView):
    """GET /clients/ — personnel de la banque uniquement."""

    serializer_class = ClientSerializer
    permission_classes = [IsAdminOrAgent]

    def get_queryset(self):
        return selectors.client_list()


class ClientDetailView(generics.RetrieveAPIView):
    """GET /clients/<pk>/ — personnel de la banque uniquement."""

    serializer_class = ClientSerializer
    permission_classes = [IsAdminOrAgent]
    queryset = Client.objects.all()
    lookup_url_kwarg = "pk"


# ---------------------------------------------------------------------------
# Ticket
# ---------------------------------------------------------------------------


class TicketCreateView(generics.CreateAPIView):
    """POST /tickets/create/ — borne libre-service, ENDPOINT PUBLIC."""

    serializer_class = TicketCreateSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        ticket = serializer.save()
        return Response(TicketSerializer(ticket).data, status=status.HTTP_201_CREATED)


class TicketListView(generics.ListAPIView):
    """GET /tickets/?status=&guichet=&service=&date= — personnel uniquement."""

    serializer_class = TicketSerializer
    permission_classes = [IsAdminOrAgent]

    def get_queryset(self):
        p = self.request.query_params
        return selectors.ticket_list(
            status=p.get("status"),
            guichet_id=p.get("guichet"),
            service_id=p.get("service"),
            date=p.get("date"),
        )


class TicketDetailView(generics.RetrieveAPIView):
    """GET /tickets/<pk>/ — personnel uniquement."""

    serializer_class = TicketSerializer
    permission_classes = [IsAdminOrAgent]
    queryset = Ticket.objects.all()
    lookup_url_kwarg = "pk"


class TicketStatusPublicView(generics.RetrieveAPIView):
    """GET /tickets/status/<ticket_code>/ — suivi client, ENDPOINT PUBLIC."""

    serializer_class = TicketSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = "ticket_code"
    lookup_url_kwarg = "ticket_code"
    queryset = Ticket.objects.all()


class CallNextTicketView(generics.GenericAPIView):
    """POST /tickets/call-next/ — l'agent appelle le prochain ticket de son guichet."""

    serializer_class = TicketSerializer
    permission_classes = [IsAgent]

    def post(self, request, *args, **kwargs):
        ticket = services.call_next_ticket(agent=request.user)
        return Response(self.get_serializer(ticket).data)


class StartTicketView(generics.GenericAPIView):
    """POST /tickets/<pk>/start/ — passe le ticket appelé en CALLED -> IN_PROGRESS."""

    serializer_class = TicketSerializer
    permission_classes = [IsAgent, IsAssignedToGuichet]
    queryset = Ticket.objects.all()
    lookup_url_kwarg = "pk"

    def post(self, request, *args, **kwargs):
        ticket = services.start_ticket(ticket=self.get_object(), agent=request.user)
        return Response(self.get_serializer(ticket).data)


class CompleteTicketView(generics.GenericAPIView):
    """POST /tickets/<pk>/complete/ — IN_PROGRESS -> COMPLETED."""

    serializer_class = TicketSerializer
    permission_classes = [IsAgent, IsAssignedToGuichet]
    queryset = Ticket.objects.all()
    lookup_url_kwarg = "pk"

    def post(self, request, *args, **kwargs):
        ticket = services.complete_ticket(ticket=self.get_object(), agent=request.user)
        return Response(self.get_serializer(ticket).data)


class MarkAbsentTicketView(generics.GenericAPIView):
    """POST /tickets/<pk>/absent/ — CALLED -> ABSENT (client ne s'est pas présenté)."""

    serializer_class = TicketSerializer
    permission_classes = [IsAgent, IsAssignedToGuichet]
    queryset = Ticket.objects.all()
    lookup_url_kwarg = "pk"

    def post(self, request, *args, **kwargs):
        ticket = services.mark_absent(ticket=self.get_object(), agent=request.user)
        return Response(self.get_serializer(ticket).data)


class CancelTicketView(generics.GenericAPIView):
    """POST /tickets/<pk>/cancel/ — WAITING/CALLED -> CANCELLED."""

    serializer_class = TicketSerializer
    permission_classes = [IsAdminOrAgent]
    queryset = Ticket.objects.all()
    lookup_url_kwarg = "pk"

    def post(self, request, *args, **kwargs):
        ticket = services.cancel_ticket(ticket=self.get_object())
        return Response(self.get_serializer(ticket).data)


class TransferTicketView(generics.GenericAPIView):
    """POST /tickets/<pk>/transfer/ — transfère le ticket vers un autre guichet."""

    serializer_class = TicketTransferSerializer
    permission_classes = [IsAgent, IsAssignedToGuichet]
    queryset = Ticket.objects.all()
    lookup_url_kwarg = "pk"

    def post(self, request, *args, **kwargs):
        ticket = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        new_ticket = services.transfer_ticket(
            ticket=ticket,
            new_guichet=serializer.validated_data["guichet"],
            agent=request.user,
        )
        return Response(TicketSerializer(new_ticket).data, status=status.HTTP_201_CREATED)
