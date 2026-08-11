"""
Permissions du système de gestion de file d'attente.

Rôles existants sur le modèle User :
    - ADMIN : gère les services, guichets, agents. Accès total.
    - AGENT : traite les tickets de SON guichet uniquement.

Les endpoints de création de ticket (borne libre-service) et de suivi
par code ticket sont volontairement publics (AllowAny), configurés
directement dans views.py.
"""

from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdmin(BasePermission):
    """Autorise uniquement les utilisateurs authentifiés avec le rôle ADMIN."""

    message = "Seul un administrateur peut effectuer cette action."

    def has_permission(self, request, view):
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and (user.is_superuser or user.role == "ADMIN")
        )


class IsAgent(BasePermission):
    """Autorise uniquement les utilisateurs authentifiés avec le rôle AGENT."""

    message = "Seul un agent guichet peut effectuer cette action."

    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and user.role == "AGENT")


class IsAdminOrAgent(BasePermission):
    """Autorise les administrateurs ET les agents."""

    message = "Réservé au personnel de la banque (agent ou administrateur)."

    def has_permission(self, request, view):
        user = request.user
        return bool(
            user and user.is_authenticated and user.role in ("ADMIN", "AGENT")
        )


class IsAdminOrReadOnly(BasePermission):
    """Lecture libre pour le personnel authentifié, écriture réservée à l'admin."""

    message = "Seul un administrateur peut modifier cette ressource."

    def has_permission(self, request, view):
        user = request.user
        if not (user and user.is_authenticated):
            return False
        if request.method in SAFE_METHODS:
            return True
        return bool(user.is_superuser or user.role == "ADMIN")


class IsAssignedToGuichet(BasePermission):
    """
    Vérifie qu'un agent n'agit que sur les tickets rattachés à SON
    propre guichet. Les administrateurs passent outre cette règle.
    À utiliser en complément de IsAgent (permission de niveau objet).
    """

    message = "Ce ticket n'est pas rattaché à votre guichet."

    def has_object_permission(self, request, view, obj):
        user = request.user
        if user.is_superuser or user.role == "ADMIN":
            return True
        if user.role != "AGENT":
            return False
        return obj.guichet_id is not None and obj.guichet_id == user.guichet_id
