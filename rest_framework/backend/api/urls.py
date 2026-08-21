from django.contrib import admin
from django.urls import path
from api import views


# jwt authentication
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
) 
from rest_framework_simplejwt.views import TokenVerifyView
 
urlpatterns = [
    
    
      # --- Services ---------------------------------------------------------
        path("services/", views.ServiceListCreateView.as_view(), name="service-list-create"),
        path("services/<int:pk>/", views.ServiceDetailView.as_view(), name="service-detail"),
    
        # --- Guichets -----------------------------------------------------------
        path("guichets/", views.GuichetListCreateView.as_view(), name="guichet-list-create"),
        path("guichets/<int:pk>/", views.GuichetDetailView.as_view(), name="guichet-detail"),
        path("guichets/<int:pk>/open/", views.GuichetOpenView.as_view(), name="guichet-open"),
        path("guichets/<int:pk>/close/", views.GuichetCloseView.as_view(), name="guichet-close"),
    
        # --- Agents ---------------------------------------------------------
        path("agents/", views.AgentListCreateView.as_view(), name="agent-list-create"),
        path("agents/<int:pk>/", views.AgentDetailView.as_view(), name="agent-detail"),
        path("agents/me/status/", views.AgentStatusUpdateView.as_view(), name="agent-status-update"),
        
    
        # --- Clients ---------------------------------------------------------
        path("clients/", views.ClientListView.as_view(), name="client-list"),
        path("clients/<int:pk>/", views.ClientDetailView.as_view(), name="client-detail"),
    
        # --- Tickets ---------------------------------------------------------
        path("tickets/create/", views.TicketCreateView.as_view(), name="ticket-create"),
        path("tickets/", views.TicketListView.as_view(), name="ticket-list"),
        path("tickets/<int:pk>/", views.TicketDetailView.as_view(), name="ticket-detail"),
        path("tickets/status/<str:ticket_code>/", views.TicketStatusPublicView.as_view(), name="ticket-status-public"),
        path("tickets/call-next/", views.CallNextTicketView.as_view(), name="ticket-call-next"),
        path("tickets/<int:pk>/start/", views.StartTicketView.as_view(), name="ticket-start"),
        path("tickets/<int:pk>/complete/", views.CompleteTicketView.as_view(), name="ticket-complete"),
        path("tickets/<int:pk>/absent/", views.MarkAbsentTicketView.as_view(), name="ticket-absent"),
        path("tickets/<int:pk>/cancel/", views.CancelTicketView.as_view(), name="ticket-cancel"),
        path("tickets/<int:pk>/transfer/", views.TransferTicketView.as_view(), name="ticket-transfer"),
    
    ##token-side 
    
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('token/user/me/',views.currentloggedUser.as_view(),name="current_user")
    
    
    
   
 
]


   


