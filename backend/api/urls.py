from django.urls import include, path
from rest_framework import routers

from . import views

router = routers.DefaultRouter()
router.register(r"folders", views.FolderView, "folders")
router.register(r"files", views.FileView, "files")

urlpatterns = [
    path(
        "",
        include(router.urls),
    )
]
