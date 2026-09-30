from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["id", "username", "email", "password"]

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
        )
        return user

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email is already in use.")
        return value

    def validate(self, attrs):
        # Unsaved instance so UserAttributeSimilarityValidator can compare
        # the password against username/email, same as Django's own forms do.
        temp_user = User(
            username=attrs.get("username", ""),
            email=attrs.get("email", ""),
        )
        try:
            validate_password(attrs["password"], user=temp_user)
        except DjangoValidationError as e:
            raise serializers.ValidationError({"password": list(e.messages)})
        return attrs


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email"]