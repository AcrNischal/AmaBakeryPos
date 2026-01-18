from django.urls import path

from . import views

urlpatterns = [
    path("users/", views.users, name="users_details"),
    path("users/<int:id>/", views.users, name="users")
]
