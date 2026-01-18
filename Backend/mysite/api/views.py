from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken  # ← IMPORT THIS

from .models import User
from .serializers import UsersSerializers


class UserView(APIView):
    def get_permissions(self):
        """Different permissions for different methods"""
        if self.request.method == "POST":
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get(self, request):
        """List all users"""
        users = User.objects.all()
        serializer = UsersSerializers(users, many=True)
        return Response(serializer.data)

    def post(self, request):
        """Register new user AND return tokens immediately"""
        serializer = UsersSerializers(data=request.data)

        if serializer.is_valid():
            # Save the user
            user = serializer.save()

            refresh = RefreshToken.for_user(user)
            return Response(
                {
                    "success": True,
                    "message": "User registered and logged in successfully!",
                    "user": {
                        "id": user.id,
                        "username": user.username,
                        "email": user.email,
                        # Add other fields from your serializer
                    },
                    "tokens": {
                        "refresh": str(refresh),  # Long-lived refresh token
                        "access": str(refresh.access_token),  # Short-lived access token
                    },
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(
            {"success": False, "errors": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST,
        )

    def delete(self, request, id=None):
        """Delete user by ID"""
        try:
            user = User.objects.get(id=id)
        except User.DoesNotExist:
            return Response(
                {
                    "success": False,
                    "errors": "user_id",
                    "message": "User Id not Found!",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        username = user.username
        user.delete()
        return Response(
            {
                "success": True,
                "message": f"{username} Deleted Successfully!",
            },
            status=status.HTTP_204_NO_CONTENT,
        )
