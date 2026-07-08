from django.shortcuts import render
from rest_framework import generics , permissions
from .models import Product, User
from .serializers import UserSerializer,ProductSerializer
from api.permissions import IsOwnerOrReadOnly

class UserListCreateAPIView(generics.ListCreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class UserRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    
    queryset = User.objects.all()
    serializer_class = UserSerializer
# Create your views here.

class ProductListCreateAPIView(generics.ListCreateAPIView):
    permissions_classes = [permissions.IsAuthenticated,IsOwnerOrReadOnly] 
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
        
        
class ProductRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    permissions_classes = [permissions.IsAuthenticated,IsOwnerOrReadOnly] 
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

