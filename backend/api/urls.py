from django.urls import include, path
from rest_framework import routers

from . import views

router = routers.DefaultRouter()
router.register(r"folders", views.FolderView, "folder")
router.register(r"files", views.FileView, "file")

urlpatterns = [path("", include(router.urls))]
