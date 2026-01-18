# api/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = UserAdmin.list_display + ("phone", "full_name", "user_type")

    list_filter = UserAdmin.list_filter + ("user_type",)

    fieldsets = UserAdmin.fieldsets + (
        ("Custom Fields", {"fields": ("phone", "full_name", "user_type")}),
    )

    # Show in add form
    add_fieldsets = UserAdmin.add_fieldsets + (
        ("Custom Fields", {"fields": ("phone", "full_name", "user_type")}),
    )
