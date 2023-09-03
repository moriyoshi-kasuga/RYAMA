import json

from django.contrib.auth import authenticate, login
from django.contrib.auth.forms import UserCreationForm
from django.http import HttpResponse, HttpResponseNotAllowed, JsonResponse
from django.shortcuts import redirect, render
from django.template.loader import render_to_string

from .markdown import convert_html
from .models import File, Folder


def page_home(request):
    if request.method == "GET":
        return render(request, "homes/home.html")
    return render(request, "homes/home.html")


def page_publish(request, id):
    try:
        file = File.objects.get(id=id, is_published=True)
        return render(
            request,
            "publish.html",
            {"preview": convert_html(file.content), "name": file.name},
        )
    except Exception:
        return redirect("home")


def page_login(request):
    context = {}
    if request.method == "POST":
        username = request.POST["username"]
        if username:
            context["username"] = username
            password = request.POST["password"]
            if password:
                user = authenticate(username=username, password=password)
                if user:
                    login(request, user)
                    return redirect("markdowns")
                else:
                    context["error"] = "It Account Not Existis"
            else:
                context["error"] = "Input Password"
        else:
            context["error"] = "Input Username"

    return render(request, "homes/login.html", context)


def page_signup(request):
    context = {}
    if request.method == "POST":
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.save()
            login(request, user)
            return redirect("markdowns")
        else:
            context["error"] = "An error occured during registration"
    else:
        form = UserCreationForm()
    context["form"] = form
    return render(request, "homes/signup.html", context)


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
    context["preview"] = convert_html(file.content)
    context["active_file"] = id
    return render(request, "markdowns/markdowns.html", context)


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
                case "is_published":
                    file.is_published = bool(context["is_published"])
                    file.save()
                    return JsonResponse({"status": True})
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
    option = request.GET.get("option")
    match option:
        case "is_published":
            return JsonResponse({"status": True, "is_published": file.is_published})
        case "content" | None:
            return JsonResponse({"status": True, "content": file.content})


def api_markdown(request):
    context = json.loads(request.body)
    match request.method:
        case "POST":
            return HttpResponse(convert_html(context["content"]))
