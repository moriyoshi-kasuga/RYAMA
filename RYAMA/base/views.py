from django.contrib.auth import authenticate, login
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth.models import User
from django.contrib.auth.views import LoginView
from django.shortcuts import redirect, render
from django.urls import reverse_lazy
from django.views.generic.edit import UpdateView

from .models import Document, Folder


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


class Login(LoginView):
    template_name = "homes/login.html"


def page_signup(request, *args, **kwargs):
    return render(request, "homes/signup.html")


# NOTE: Markdowns


def page_markdowns(request, *args, **kwargs):
    user = request.user
    if not user.is_authenticated:
        return redirect("login")
    if len(Folder.objects.filter(user=user, is_explorer=True)) == 0:
        Folder.objects.create(user=user, name=user.username, is_explorer=True)
    # if request == "POST":
    return render(
        request,
        "markdowns/markdowns.html",
        {"markdowns": Folder.objects.filter(user=user)},
    )
