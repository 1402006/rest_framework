
from rest_framework import serializers
from .models import  Product,Ticket,Client,Guichet
from api.models import User as auth_user
# Create your views here.

class UserSerializer(serializers.ModelSerializer):
    
   
    class Meta:
        model = auth_user
        fields = ['id', 
                  'username', 
                  'email', 
                  'password',
                  'is_superuser',
                  "date_joined",
                  "last_login",
                  "is_active",
                  "first_name",
                  "last_name",
                  "phone",
                  "service"
                  "photo",
                  "role"
                  "guichet"
                  ]
        read_only_fields = ['uid','is_superuser,guichet,role']

    def create(self, validated_data):
        
        return auth_user.objects.create_user(**validated_data)
    
    def update(self, instance, validated_data):
        instance.username = validated_data.get('username', instance.username)
        instance.email = validated_data.get('email', instance.email)
        password = validated_data.get('password', None)
        if password:
            instance.set_password(password)
        instance.save()
        return instance
    

class ProductSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Product
        fields = ['product_id', 'product_name', 'product_description', 'product_price', 'product_image', 'product_stock', 'user']
        read_only_fields = ['product_id', 'user']

    """   def create(self, validated_data):
        return Product.objects.create(**validated_data)
    """        
    
    def update(self, instance, validated_data):
        instance.product_name = validated_data.get('product_name', instance.product_name)
        instance.product_description = validated_data.get('product_description', instance.product_description)
        instance.product_price = validated_data.get('product_price', instance.product_price)
        instance.product_image = validated_data.get('product_image', instance.product_image)
        instance.product_stock = validated_data.get('product_stock', instance.product_stock)
        instance.save()
        return instance    
    
class ClientSerializers(serializers.ModelSerializer):
     class Meta :
        model = Client
        fieds = [
            "id_client",
            "client_name",
            "client_phone_number",
            "client_email",
            "client_ticket",
            "login_date"
                 ] 
        read_only_fields =["id_client","login_date"]
        
        def create(self, validated_data):
        
            return auth_user.objects.create_user(**validated_data)
    
        def update(self, instance, validated_data):
            instance.client_name = validated_data.get('client_name', instance.client_name)
            instance.client_email = validated_data.get('client_email', instance.client_email)
            instance.client_phone_number= validated_data.get('client_phonr_number',instance.client_phone_number)
            instance.client_ticket = validated_data.get('client_ticket',instance.client_ticket)
            instance.save()
            return instance
        
        
class GuichetSerializers(serializers.ModelSerializer):
     class Meta :
        model = Guichet
        fieds = [
            "id_guichet",
            "guichet_name",
            "guichet_description",
            "guichet_status",
            "user_id",
            
                 ] 
        read_only_fields =["id_guichet","user__id"]
class TicketSerializers(serializers.ModelSerializer):
     class Meta :
        model = Ticket
        fieds = [
            "service",
            "ticket_code",
            "ticket_status","",
            "created_at",
            "closed_at",
            "priority",
            "guichet"
            
                 ] 
        read_only_fields =["service","ticket_code","guichet"]