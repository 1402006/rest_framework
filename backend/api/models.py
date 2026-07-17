from django.db import models
from django.contrib.auth.models import User as auth_user
from api.tickets_generator import generate_ticket_code
from django.contrib.auth.models import AbstractUser
from django.conf import settings

# Create your models here.
    
class Product(models.Model):
    product_id=models.AutoField(primary_key=True)
    product_name = models.CharField(max_length=100)
    product_description = models.TextField()
    product_price = models.DecimalField(max_digits=10, decimal_places=2)
    product_image = models.ImageField(upload_to='product_images/')
    product_stock = models.IntegerField()
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='products'
        )

    def __str__(self):
        return self.product_name



class Service(models.Model):
    
    class TypeServices(models.TextChoices):
        DEPOT = "DEPOT", "Dépôt"
        RETRAIT = "RETRAIT", "Retrait"
        ASSISTANCE = "ASSISTANCE", "Assistance"

    service_type = models.CharField(
        max_length=10, 
        choices=TypeServices.choices
        )
    
    service_description = models.TextField()
    is_active = models.BooleanField(default=True)
    
    
class Guichet(models.Model):
    
    class TypeGuichetStatus(models.TextChoices):
        DEPOT = "BUSY", "depot"
        RETRAIT = "FREE", "free"
        ASSISTANCE = "REPARING", "reparing"
    
    id_guichet = models.AutoField(primary_key=True)
    guichet_name = models.CharField(max_length=70)
    guichet_description = models.TextField()
    guichet_status = models.CharField( 
        max_length=50 , 
        choices=TypeGuichetStatus.choices
        
        )
    user_id = models.ForeignKey(
        auth_user,
        on_delete=models.CASCADE, 
        related_name="guichets"
        )

class Ticket(models.Model):
    
    class TypeTicketstStatus(models.TextChoices):
        DEPOT = "CREATED", "created"
        RETRAIT = "TURNING", "turning"
        ASSISTANCE = "DELETED", "deleted"
      
    id_ticket = models.AutoField(primary_key=True)
    guichet = models.ForeignKey(Guichet, on_delete=models.CASCADE , related_name="ticket")
    service = models.ForeignKey(Service, on_delete=models.CASCADE)
    
    ticket_code = models.CharField(
        max_length=10,
        unique=True,
        editable=False
    )
    ticket_status = models.CharField(
        max_length=10,
        choices=TypeTicketstStatus.choices,
        unique= True
    )
    
    def save(self, *args, **kwargs):

        if not self.ticket_code:
            self.ticket_code = generate_ticket_code(
                self.service.service_type
            )

        super().save(*args, **kwargs)
    
class Client(models.Model):
    
    id_client = models.AutoField(primary_key=True),
    client_name = models.CharField(max_length = 40),
    client_phone_number =models.BigIntegerField() ,
    client_email = models.CharField(max_length=100),
    client_ticket =models.ForeignKey(Ticket, on_delete=models.CASCADE,related_name="client") ,
    login_date =  models.DateTimeField(auto_now_add=True)
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE,related_name="client")
    
class User(AbstractUser) :
    
    class Role (models.TextChoices):
        ADMIN = "ADMIN", "admin"
        AGENT = "AGENT" ,"agent"
    
    phone=models.BigIntegerField()
    born_date = models.DateTimeField()
    service = models.ForeignKey(Service, on_delete=models.CASCADE,related_name="user")
    photo = models.ImageField(upload_to="")
    role= models.CharField(max_length=20, choices=Role.choices())
    guichet  = models.ForeignKey(Guichet , on_delete=models.CASCADE , related_name="user")  
    
    
   