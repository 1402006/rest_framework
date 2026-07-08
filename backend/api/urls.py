from django.contrib import admin
from django.urls import path

from .views import UserListCreateAPIView, UserRetrieveUpdateDestroyAPIView,ProductListCreateAPIView, ProductRetrieveUpdateDestroyAPIView

urlpatterns = [
    path("users/", UserListCreateAPIView.as_view(), name="user-list-create"),
    path("users/<int:pk>/", UserRetrieveUpdateDestroyAPIView.as_view(), name="user-retrieve-update-destroy"),
    path("products/", ProductListCreateAPIView.as_view(), name="product-list-create"),
    path("products/<str:product_name>/", ProductRetrieveUpdateDestroyAPIView.as_view(), name="product-retrieve-update-destroy"),
]

