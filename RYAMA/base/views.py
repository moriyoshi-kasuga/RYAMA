import json

from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from django.shortcuts import redirect, render

# def page_test(request, *args, **kwargs):
#     return render(request, "test.html")


# Create your views here.


def page_markdowns(request, *args, **kwargs):
    return render(request, "markdowns.html", context={"theme": "dark"})


def page_home(request, *args, **kwargs):
    if request.method == "GET":
        return render(request, "homes/home.html")
    return render(request, "homes/home.html")


def page_why(request, *args, **kwargs):
    if request.method == "GET":
        return render(request, "homes/why.html")
    return render(request, "homes/why.html")


def page_feature(request, *args, **kwargs):
    if request.method == "GET":
        return render(request, "homes/feature.html")
    return render(request, "homes/feature.html")


def page_login(request, *args, **kwargs):
    return render(request, "homes/login.html")


def page_signup(request, *args, **kwargs):
    return render(request, "homes/signup.html")


def page_account(request, *args, **kwargs):
    context = {
        "usernames": json.dumps(list(User.objects.values_list("username", flat=True)))
    }
    if request.method == "GET":
        return render(request, "homes/account.html", context=context)
    sign = request.POST["sign"]
    if sign == "in":
        username = request.POST["name"]
        password = request.POST["password"]
        user = authenticate(username=username, password=password)
        if user is not None:
            login(request, user)
            return redirect("home")
        context["in_username"] = username
        context["in_error"] = "このユーザーは存在しません"
    elif sign == "up":
        pass
    else:
        pass

    return render(request, "homes/account.html", context=context)
