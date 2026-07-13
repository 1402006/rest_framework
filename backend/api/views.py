from django.shortcuts import render
from rest_framework import generics , permissions
from .models import Product
from .serializers import UserSerializer,ProductSerializer
from api.permissions import IsOwnerOrReadOnly
from django.contrib.auth.models import User as auth_user
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.response import Response


class UserListCreateAPIView(generics.ListCreateAPIView):
    queryset = auth_user.objects.all()
    serializer_class = UserSerializer

class UserRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    
    queryset = auth_user.objects.all()
    serializer_class = UserSerializer
    
# Create your views here.


class ProductListCreateAPIView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated,IsOwnerOrReadOnly] 
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    
    def perform_create(self, serializer):
        print(self.request.user)
        print(self.request.user.id)
        serializer.save(user=self.request.user)
        
        
        
class ProductRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    permissions_classes = [permissions.IsAuthenticated,IsOwnerOrReadOnly] 
    queryset = Product.objects.all()
    lookup_field = "product_name"
    lookup_url_kwarg = "product_name"
    serializer_class = ProductSerializer

    def perform_create(self, serializer):
        print(self.request.user)
        print(self.request.user.id)
        serializer.save(user=self.request.user)
       

