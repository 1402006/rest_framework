from django.contrib import admin
from django.urls import path
from .views import UserListCreateAPIView, UserRetrieveUpdateDestroyAPIView,ProductListCreateAPIView, ProductRetrieveUpdateDestroyAPIView
from rest_framework.authtoken.views import obtain_auth_token


# jwt authentication
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
) 
from rest_framework_simplejwt.views import TokenVerifyView
 
urlpatterns = [
    path("users/", UserListCreateAPIView.as_view(), name="user-list-create"),
    path("users/<int:pk>/", UserRetrieveUpdateDestroyAPIView.as_view(), name="user-retrieve-update-destroy"),
    path("products/", ProductListCreateAPIView.as_view(), name="product-list-create"),
    path("products/<str:product_name>/", ProductRetrieveUpdateDestroyAPIView.as_view(), name="product-retrieve-update-destroy"),
    
    ##token-side 
    
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),
]

urlpatterns += [
    path('api-token-auth/', obtain_auth_token),
]
   


