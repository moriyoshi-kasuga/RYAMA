from django.contrib.auth.views import LogoutView
from django.urls import path

from . import views

urlpatterns = [
    # path("test/", views.page_test, name="test"),
    # NOTE: ↑ of TEST page
    path("", views.page_home, name="home"),
    path("markdowns/", views.page_markdowns, name="markdowns"),
    path("account/", views.page_account, name="account"),
    path("why/", views.page_why, name="why"),
    path("feature/", views.page_feature, name="feature"),
    path("logout/", LogoutView.as_view(next_page="home"), name="logout"),
]