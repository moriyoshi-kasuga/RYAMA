from django.shortcuts import render
from rest_framework import viewsets

from .models import File, Folder
from .serializers import FileSerializer, FolderSerializer


# Create your views here.
class FolderView(viewsets.ModelViewSet):
    serializer_class = FolderSerializer
    queryset = Folder.objects.all()


class FileView(viewsets.ModelViewSet):
    serializer_class = FileSerializer
    queryset = File.objects.all()
