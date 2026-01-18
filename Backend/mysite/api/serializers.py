from rest_framework import serializers

from .models import User


class UsersSerializers(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "password",
            "phone",
            "full_name",
            "user_type",
        ]
        extra_kwargs = {
            "password": {"write_only": True},
            "email": {"required": True},
            "phone": {"required": False, "allow_blank": True},
            "full_name": {"required": False, "allow_blank": True},
            "user_type": {"required": False, "default": "WAITER"},
        }

    def create(self, validated_data):
        """Use Django's create_user method which handles password hashing"""
        password = validated_data.pop("password", None)

        user = User.objects.create_user(
            **validated_data,  # This unpacks: username, email, phone, full_name, user_type
            password=password,
        )
        return user
