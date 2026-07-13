from django.contrib import admin
from django.urls import path
from .views import UserListCreateAPIView, UserRetrieveUpdateDestroyAPIView,ProductListCreateAPIView, ProductRetrieveUpdateDestroyAPIView
from rest_framework.authtoken.views import obtain_auth_token 
 
urlpatterns = [
    path("users/", UserListCreateAPIView.as_view(), name="user-list-create"),
   path("users/<int:pk>/", UserRetrieveUpdateDestroyAPIView.as_view(), name="user-retrieve-update-destroy"),
    path("products/", ProductListCreateAPIView.as_view(), name="product-list-create"),
    path("products/<str:product_name>/", ProductRetrieveUpdateDestroyAPIView.as_view(), name="product-retrieve-update-destroy"),
  
]

urlpatterns += [
    path('api-token-auth/', obtain_auth_token),
]
   


