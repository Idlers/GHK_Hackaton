from rest_framework import serializers
from .models import User
from django.contrib.auth import get_user_model

UserModel = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserModel
        fields = ("id", "username", "first_name", "last_name", "email", "role")


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = UserModel
        fields = ("username", "password", "first_name", "last_name", "email", "role")

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = UserModel(**validated_data)
        user.set_password(password)
        user.save()
        return user