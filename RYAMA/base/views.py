from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from django.shortcuts import redirect, render

from .models import Folder


def page_home(request, *args, **kwargs):
    if request.method == "GET":
        return render(request, "homes/home.html")
    return render(request, "homes/home.html")


def page_publish(request, *args, **kwargs):
    if request.method == "GEt":
        return render(request, "homes/publish.html")
    return render(request, "homes/publish.html")


def page_about(request, *args, **kwargs):
    if request.method == "GET":
        return render(request, "homes/about.html")
    return render(request, "homes/about.html")


def page_features(request, *args, **kwargs):
    if request.method == "GET":
        return render(request, "homes/features.html")
    return render(request, "homes/features.html")


def page_login(request, *args, **kwargs):
    return render(request, "homes/login.html")


def page_signup(request, *args, **kwargs):
    return render(request, "homes/signup.html")


def page_markdowns(request, *args, **kwargs):
    return render(request, "markdowns.html", {"markdowns": Folder.objects.all()})
