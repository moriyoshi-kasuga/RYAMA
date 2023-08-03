from django.contrib.auth.views import LogoutView
from django.urls import path

from . import views

urlpatterns = [
    # path("test/", views.page_test, name="test"),
    # NOTE: ↑ of TEST page
    path("", views.page_home, name="home"),
    path("login", views.page_login, name="login"),
    path("signup", views.page_signup, name="signup"),
    path("publish", views.page_publish, name="publish"),
    path("about/", views.page_about, name="about"),
    path("features/", views.page_features, name="features"),
    path("logout/", LogoutView.as_view(next_page="home"), name="logout"),
]
