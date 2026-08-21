from rest_framework import serializers

from api import selectors
from .models import Client, Guichet, Service, Ticket, User

from api import services

# ---------------------------------------------------------------------------
# Service
# ---------------------------------------------------------------------------


class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = ["id", "service_type", "service_description", "is_active","code_service","priorite","duree_estimee"]

# ---------------------------------------------------------------------------
# Guichet
# ---------------------------------------------------------------------------

class GuichetSerializer(serializers.ModelSerializer):
    """Utilisé en écriture (création / mise à jour) : services par id."""

    services = serializers.PrimaryKeyRelatedField(
        queryset=Service.objects.all(), many=True
    )

    class Meta:
        model = Guichet
        fields = [
            "id",
            "guichet_name",
            "guichet_description",
            "guichet_status",
            "services",
        ]


class GuichetDetailSerializer(serializers.ModelSerializer):
    """Utilisé en lecture : services imbriqués + file d'attente en direct."""

    services = ServiceSerializer(many=True, read_only=True)
    waiting_count = serializers.SerializerMethodField()

    class Meta:
        model = Guichet
        fields = [
            "id",
            "guichet_name",
            "guichet_description",
            "guichet_status",
            "services",
            "waiting_count",
        ]

    def get_waiting_count(self, obj):
        return selectors.guichet_waiting_count(guichet=obj)

# ---------------------------------------------------------------------------
# Agent (User)
# ---------------------------------------------------------------------------


class AgentSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "first_name",
            "last_name",
            "email",
            "phone",
            "born_date",
            "role",
            "agent_status",
            "guichet",
            "is_active",
        ]
        read_only_fields = ["is_active"]


class AgentCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "password",
            "first_name",
            "last_name",
            "email",
            "phone",
            "born_date",
            "role",
            "guichet",
        ]

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class AgentStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["agent_status"]


# ---------------------------------------------------------------------------
# Client
# ---------------------------------------------------------------------------


class ClientSerializer(serializers.ModelSerializer):
    # Le numéro de carte n'est jamais renvoyé en clair par l'API :
    # write_only en entrée, version masquée en sortie.
    numero_carte_credit = serializers.IntegerField(write_only=True, required=False)
    carte_masquee = serializers.SerializerMethodField()

    class Meta:
        model = Client
        fields = [
            "id_client",
            "client_name",
            "client_phone_number",
            "client_email",
            "login_date",
            "numero_carte_credit",
            "carte_masquee",
        ]
        read_only_fields = ["login_date"]

    def get_carte_masquee(self, obj):
        if not obj.numero_carte_credit:
            return None
        digits = str(obj.numero_carte_credit)
        return f"**** {digits[-4:]}" if len(digits) >= 4 else "****"

# ---------------------------------------------------------------------------
# Ticket
# ---------------------------------------------------------------------------

class TicketSerializer(serializers.ModelSerializer):
    """Sérialiseur de lecture — entièrement read-only, imbriqué."""

    service = ServiceSerializer(read_only=True)
    guichet = GuichetSerializer(read_only=True)
    owner = ClientSerializer(read_only=True)
    called_by = AgentSerializer(read_only=True)
    queue_position = serializers.SerializerMethodField()

    class Meta:
        model = Ticket
        fields = [
            "id_ticket",
            "ticket_code",
            "ticket_status",
            "service",
            "guichet",
            "owner",
            "called_by",
            "created_at",
            "called_at",
            "finished_at",
            "queue_position",
        ]
        read_only_fields = fields

    def get_queue_position(self, obj):
        return selectors.queue_position(ticket=obj)

class TicketCreateSerializer(serializers.Serializer):
    """
    Utilisé par la borne libre-service (endpoint public). Le guichet
    est choisi automatiquement par répartition de charge, sauf si
    fourni explicitement.
    """

    service = serializers.PrimaryKeyRelatedField(
        queryset=Service.objects.filter(is_active=True)
    )
    guichet = serializers.PrimaryKeyRelatedField(
        queryset=Guichet.objects.all(), required=False
    )
    client_name = serializers.CharField(max_length=40)
    client_phone_number = serializers.IntegerField()
    client_email = serializers.EmailField()
    numero_carte_credit = serializers.IntegerField(required=False, allow_null=True)

    def create(self, validated_data):
        guichet = validated_data.get("guichet")
        return services.ticket_create(
            service_id=validated_data["service"].id,
            guichet_id=guichet.id if guichet else None,
            client_name=validated_data["client_name"],
            client_phone_number=validated_data["client_phone_number"],
            client_email=validated_data["client_email"],
            numero_carte_credit=validated_data.get("numero_carte_credit"),
        )


class TicketTransferSerializer(serializers.Serializer):
    guichet = serializers.PrimaryKeyRelatedField(queryset=Guichet.objects.all())
