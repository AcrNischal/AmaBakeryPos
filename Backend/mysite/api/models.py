from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    phone = models.CharField(max_length=15, blank=True)
    USER_TYPE_CHOICES = [
        ("ADMIN", "Admin"),
        ("WAITER", "Waiter"),
        ("KITCHEN_STAFF", "Kitchen_Staff"),
    ]
    full_name = models.CharField(max_length=20, blank=True)
    user_type = models.CharField(
        max_length=20, choices=USER_TYPE_CHOICES, default="WAITER"
    )

    def __str__(self):
        return self.username
