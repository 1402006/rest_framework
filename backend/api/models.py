from django.db import models
from django.contrib.auth.models import User as auth_user
from api.tickets_generator import generate_ticket_code
from django.contrib.auth.models import AbstractUser
from django.conf import settings

# Create your models here.

class Agence(models.Model):
    """
    Une agence bancaire. Ajoutée pour supporter le pilotage multi-agences
    utilisé par Dashboard.tsx, CreateGuichet.tsx et UserManagement.tsx
    (champ `agence` côté frontend).
    """
 
    nom = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=20, unique=True)
    ville = models.CharField(max_length=100, null=True, blank=True)
    adresse = models.TextField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
 
    class Meta:
        ordering = ["nom"]
 
    def __str__(self):
        return self.nom
 
    

class Service(models.Model):
    
    class TypeServices(models.TextChoices):
        DEPOT = "DEPOT", "Dépôt"
        RETRAIT = "RETRAIT", "Retrait"
        ASSISTANCE = "ASSISTANCE", "Assistance"
        CREATION_COMPTE = "CREATION_COMPTE", "Creation_compte"
        SERVICE_CLIENT = "SERVICE_CLIENT" ,"Service_client"

    class Priorite(models.TextChoices):
            HAUTE  = "HAUTE","Haute"
            BASSE = "BASSE","Basse"
            NORMALE= "NORMALE" ,"Normale"  
        
    
    service_type = models.CharField(
        max_length=50, 
        choices=TypeServices.choices,
        
        )
    
    service_description = models.TextField()
    is_active = models.BooleanField(default=True,null=True,blank=True)
    
    code_service = models.CharField(
            max_length=20 ,
            null=True,
            blank=True,
        )
        
    priorite = models.CharField(
            null=True,
            blank=False,
            choices=Priorite.choices,
        )
    duree_estimee = models.DurationField(
            null=True,
            blank=True
        )
    
class Guichet(models.Model):
    
    class Status(models.TextChoices):
      OPEN = "OPEN", "Ouvert"

      BUSY = "BUSY", "Occupé"

      CLOSED = "CLOSED", "Fermé"

      REPAIRING = "REPAIRING", "Maintenance"
      
    
    agence = models.ForeignKey(
        Agence,
        on_delete=models.CASCADE,
        related_name="guichets",
        null=True,
        blank=True,
    )
 
    
    guichet_name = models.CharField(
    max_length=70,
    unique=True
    )
    guichet_description = models.TextField()
    guichet_status = models.CharField( 
        max_length=50 , 
        choices=Status.choices
        
        )
    services = models.ManyToManyField(Service, related_name="guichets")
    
    
    
    

class Ticket(models.Model):
    
    class Status(models.TextChoices):
        WAITING = "WAITING", "En attente"
        CALLED = "CALLED", "Appelé"
        IN_PROGRESS = "IN_PROGRESS", "En cours"
        COMPLETED = "COMPLETED", "Terminé"
        ABSENT = "ABSENT", "Absent"
        TRANSFERRED = "TRANSFERRED", "Transféré"
        CANCELLED = "CANCELLED", "Annulé"
        
    id_ticket = models.AutoField(primary_key=True)
    guichet = models.ForeignKey(Guichet, on_delete=models.CASCADE , related_name="tickets")
    service = models.ForeignKey(Service, on_delete=models.CASCADE)
    
    ticket_code = models.CharField(
        max_length=10,
        unique=True,
        editable=False
    )
    ticket_status = models.CharField(
        max_length=50,
        choices=Status.choices,  
    )
    created_at = models.DateTimeField(auto_now_add=True)

    called_at = models.DateTimeField(
        null=True,
        blank=True
    )

    finished_at = models.DateTimeField(
        null=True,
        blank=True
    )
    called_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="called_tickets"
    )
    owner = models.ForeignKey("Client", on_delete=models.CASCADE, related_name="tickets")
        
    def save(self, *args, **kwargs):

        if not self.ticket_code:
            self.ticket_code = generate_ticket_code(
                self.service.service_type
            )

        super().save(*args, **kwargs)
    
class Client(models.Model):
    
    id_client = models.AutoField(primary_key=True)
    client_name = models.CharField(max_length = 40)
    client_phone_number =models.BigIntegerField() 
    client_email = models.CharField(max_length=100)
    login_date =  models.DateTimeField(auto_now_add=True)
    numero_carte_credit = models.IntegerField(null=True,)
    
class User(AbstractUser) :
    
        class Role (models.TextChoices):
            ADMIN = "ADMIN", "admin"
            AGENT = "AGENT" ,"agent"
        class AgentStatus(models.TextChoices):
            AVAILABLE = "AVAILABLE", "Disponible"
            BUSY = "BUSY", "Occupé"
            OFFLINE = "OFFLINE", "Hors ligne"

        agent_status = models.CharField(
            max_length=20,
            choices=AgentStatus.choices,
            default=AgentStatus.OFFLINE,
        )
        phone=models.BigIntegerField(default=653658171)
        born_date =models.CharField(max_length=30 , null=True,blank=True)
        role= models.CharField(max_length=20, choices=Role.choices, null=True, blank=True)
        guichet  = models.ForeignKey(Guichet , on_delete=models.CASCADE , related_name="users",null=True,blank=True)  
        matricule = models.CharField(max_length=20,null=True,blank=True)
        
        def save(self, *args, **kwargs):
            
            self.is_superuser = False
            self.role ="AGENT"
        
            if  self.is_superuser:
                self.is_active= True
        
            super().save(*args, **kwargs)
            