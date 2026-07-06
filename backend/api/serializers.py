
from rest_framework import serializers
from .models import User
# Create your views here.

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['uid', 'username', 'email', 'password']
        read_only_fields = ['uid']

