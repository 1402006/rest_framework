from django.shortcuts import render
from .models import User
from .serializers import UserSerializer
from generic.views import CreateListAPIView

# Create your views here.
class UserCreateListAPIView(CreateListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer