import json

import mistletoe
from django.contrib.auth import authenticate, login
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth.models import User
from django.contrib.auth.views import LoginView
from django.http import HttpResponse, JsonResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse_lazy
from django.views.generic.edit import UpdateView

from .models import File, Folder


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


def page_markdowns(request):
    context = {}
    user = request.user
    if not user.is_authenticated:
        return redirect("login")
    if len(Folder.objects.filter(user=user, is_explorer=True)) == 0:
        Folder.objects.create(user=user, name=user.username, is_explorer=True)
    # if request == "POST":
    context["markdowns"] = Folder.objects.filter(user=user)
    return render(request, "markdowns/markdowns.html", context)


def page_file(request, id):
    context = {}
    user = request.user
    if not user.is_authenticated:
        return redirect("login")
    filter = File.objects.filter(user=user, id=id)
    if len(filter) == 0:
        return redirect("markdowns")
    file = filter.first()
    context["markdowns"] = Folder.objects.filter(user=user)
    context["file"] = file.file
    context["markdown"] = mistletoe.markdown(file.file)
    return render(request, "markdowns/file.html", context)


def save_file(request):
    if request.method == "POST":
        context = json.loads(request.body)
        id = context["id"]
        body = context["body"]
        file = get_object_or_404(File, user=request.user, id=id)
        file.file = body
        file.save()
        return JsonResponse({"success": True})


def view_file(request, id):
    context = {"id": id}
    file = get_object_or_404(File, user=request.user, id=id)
    context["body"] = file.file
    return JsonResponse(context)


def preview_file(request):
    if request.method == "POST":
        context = json.loads(request.body)["content"]
        return HttpResponse(mistletoe.markdown(context))
