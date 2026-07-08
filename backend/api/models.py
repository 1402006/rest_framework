from django.db import models
from django.contrib.auth.models import User as auth_user

# Create your models here.
class User(models.Model):
    uid=models.AutoField(primary_key=True)
    username = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=100)

    def __str__(self):
        return self.username 
    
class Product(models.Model):
    product_id=models.AutoField(primary_key=True)
    product_name = models.CharField(max_length=100)
    product_description = models.TextField()
    product_price = models.DecimalField(max_digits=10, decimal_places=2)
    product_image = models.ImageField(upload_to='product_images/')
    product_stock = models.IntegerField()
    user = models.ForeignKey(auth_user, on_delete=models.CASCADE, related_name='products')

    def __str__(self):
        return self.product_name