
from rest_framework import serializers
from .models import  Product
from django.contrib.auth.models import User as auth_user
# Create your views here.

class UserSerializer(serializers.ModelSerializer):
    
   
    class Meta:
        model = auth_user
        fields = ['id', 'username', 'email', 'password']
        read_only_fields = ['uid']

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
    
  
        