from django.contrib.auth.views import LogoutView
from django.urls import path

from . import views

urlpatterns = [
    path("", views.page_home, name="home"),
    path("login/", views.page_login, name="login"),
    path("signup/", views.page_signup, name="signup"),
    path("publish/", views.page_publish, name="publish"),
    path("about/", views.page_about, name="about"),
    path("features/", views.page_features, name="features"),
    path("logout/", LogoutView.as_view(next_page="home"), name="logout"),
    path("markdowns/", views.page_markdowns, name="markdowns"),
    path("markdowns/<uuid:id>", views.page_file, name="markdown"),
    path("api/file/", views.api_file, name="ApiFile"),
    path("api/file/<uuid:id>", views.api_file_get, name="ApiFileGet"),
    path("api/folder/", views.api_folder, name="ApiFolder"),
    path("api/explorer/", views.api_explorer_get, name="explorerGet"),
    path("api/explorer/file/", views.api_explorer_file, name="explorerFile"),
    path("api/explorer/folder/", views.api_explorer_folder, name="explorerFolder"),
]
