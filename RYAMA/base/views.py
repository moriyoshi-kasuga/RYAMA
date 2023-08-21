import json

import mistletoe
from django.contrib.auth import authenticate, login
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.views import LoginView
from django.http import JsonResponse
from django.http.response import HttpResponseNotAllowed
from django.shortcuts import redirect, render
from django.template.loader import render_to_string

from .models import File, Folder


def page_home(request):
    if request.method == "GET":
        return render(request, "homes/home.html")
    return render(request, "homes/home.html")


def page_publish(request):
    if request.method == "GEt":
        return render(request, "homes/publish.html")
    return render(request, "homes/publish.html")


def page_about(request):
    if request.method == "GET":
        return render(request, "homes/about.html")
    return render(request, "homes/about.html")


def page_features(request):
    if request.method == "GET":
        return render(request, "homes/features.html")
    return render(request, "homes/features.html")


class Login(LoginView):
    template_name = "homes/login.html"


def page_signup(request):
    if request.method == "POST":
        form = UserCreationForm(request.POST)
        if form.is_valid():
            form.save()
            username = form.cleaned_data.get("username")
            raw_password = form.cleaned_data.get("password1")
            user = authenticate(username=username, password=raw_password)
            login(request, user)
            return redirect("markdowns")
        return form.error_messages
    else:
        form = UserCreationForm()
    return render(request, "homes/signup.html", {"form": form})


# NOTE: Markdowns


def page_markdowns(request):
    user = request.user
    if not user.is_authenticated:
        return redirect("login")
    context = {}
    Folder.objects.get_or_create(user=user, is_explorer=True, name=user.username)
    context["is_explorer"] = True
    return render(request, "markdowns/markdowns.html", context)


def page_file(request, id):
    user = request.user
    if not user.is_authenticated:
        return redirect("login")
    context = {}
    filter = File.objects.filter(user=user, id=id)
    if len(filter) == 0:
        return redirect("markdowns")
    file = filter.first()
    context["content"] = file.content
    context["preview"] = mistletoe.markdown(file.content)
    context["active_file"] = id
    return render(request, "markdowns/markdowns.html", context)


# NOTE:EMPTY


def api_explorer_get(request):
    user = request.user
    if not user.is_authenticated:
        return HttpResponseNotAllowed()
    Folder.objects.get_or_create(user=user, is_explorer=True, name=user.username)
    context = {"markdowns": Folder.objects.filter(user=user)}
    return render(request, "markdowns/explorer.html", context=context)


def api_explorer_folder(request):
    user = request.user
    if not user.is_authenticated:
        return HttpResponseNotAllowed()
    explorer, created = Folder.objects.get_or_create(
        user=user, is_explorer=True, name=user.username
    )
    match request.method:
        case "POST":
            folder = Folder.objects.create(user=user, parent=explorer, name="Empty")
            response = {"status": True, "id": folder.id}
            response["successHTML"] = render_to_string(
                "markdowns/folder.html", {"node": folder}
            )
            return JsonResponse(response)


def api_explorer_file(request):
    user = request.user
    if not user.is_authenticated:
        return HttpResponseNotAllowed()
    explorer, created = Folder.objects.get_or_create(
        user=user, is_explorer=True, name=user.username
    )
    match request.method:
        case "POST":
            file = File.objects.create(
                user=user,
                parent=explorer,
                name="Empty",
            )
            response = {"status": True, "id": file.id}
            response["successHTML"] = render_to_string(
                "markdowns/file.html", {"file": file}
            )
            return JsonResponse(response)


def api_folder(request):
    user = request.user
    if not user.is_authenticated:
        return JsonResponse({"status": False, "message": "not user logined"})
    context = json.loads(request.body)
    id = context["id"]
    match request.method:
        case "POST":
            folder = Folder.objects.create(
                user=user,
                parent=Folder.objects.get(user=user, id=id),
                name="Empty",
            )
            response = {"status": True, "id": folder.id}
            response["successHTML"] = render_to_string(
                "markdowns/folder.html", {"node": folder}
            )
            return JsonResponse(response)
        case "GET":
            return JsonResponse(
                {
                    "status": True,
                    "files": list(Folder.objects.filter(user=user).values()),
                }
            )
    try:
        folder = Folder.objects.get(user=user, id=id)
    except Exception:
        return JsonResponse(
            {"status": False, "message": "Folder not found."},
        )
    match request.method:
        case "PUT":
            name = context["name"]
            folder.name = name
            folder.save()
            return JsonResponse(
                {"status": True, "message": "success change Folder name.", "name": name}
            )
        case "DELETE":
            folder.delete()
            return JsonResponse(
                {"status": True, "message": "Folder deleted."},
            )
    return JsonResponse(
        {"status": False, "message": "No access with this method."},
    )


def api_file(request):
    user = request.user
    if not user.is_authenticated:
        return JsonResponse({"status": False, "message": "not user logined"})
    context = json.loads(request.body)
    id = context["id"]
    match request.method:
        case "POST":
            file = File.objects.create(
                user=user,
                parent=Folder.objects.get(user=user, id=id),
                name="Empty",
            )
            response = {"status": True, "id": file.id}
            response["successHTML"] = render_to_string(
                "markdowns/file.html", {"file": file}
            )
            return JsonResponse(response)
        case "GET":
            return JsonResponse(
                {
                    "status": True,
                    "files": list(File.objects.filter(user=user).values()),
                }
            )
    try:
        file = File.objects.get(user=user, id=id)
    except Exception:
        return JsonResponse(
            {"status": False, "message": "File not found."},
        )
    match request.method:
        case "PUT":
            option = context["option"]
            match option:
                case "content":
                    file.content = context["body"]
                    file.save()
                    return JsonResponse({"status": True})
                case "name":
                    name = context["name"]
                    file.name = name
                    file.save()
                    return JsonResponse({"status": True, "name": name})
        case "DELETE":
            file.delete()
            return JsonResponse(
                {"status": True, "message": "File deleted."},
            )
    return JsonResponse(
        {"status": False, "message": "No access with this method."},
    )


def api_file_get(request, id):
    user = request.user
    if not user.is_authenticated:
        return JsonResponse({"status": False, "message": "not user logined"})
    try:
        file = File.objects.get(user=user, id=id)
    except Exception:
        return JsonResponse(
            {"status": False, "message": "File not found."},
        )
    return JsonResponse({"status": True, "content": file.content})
