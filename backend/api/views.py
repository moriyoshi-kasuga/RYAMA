from django.contrib.auth.models import User
from rest_framework import viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.status import HTTP_201_CREATED, HTTP_400_BAD_REQUEST

from .models import File, Folder
from .serializers import FileSerializer, FolderSerializer, UserSerializer


# Create your views here.
class FolderView(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = FolderSerializer
    queryset = Folder.objects.all()

    def get_permissions(self):
        return super().get_permissions()

    def list(self, request):
        data = FolderSerializer(
            Folder.objects.all()
            .select_related("user")
            .order_by("created_at")
            .reverse(),
            many=True,
        ).data

        return Response(status=200, data=data)

    def retrieve(self, request, pk=None):
        data = FolderSerializer(Folder.objects.get(uuid=pk), many=False).data
        return Response(status=200, data=data)

    def create(self, request):
        folder = Folder.objects.create(
            user=request.user,
            name=request.data["name"],
        )
        serializer = FolderSerializer(folder, many=False)
        response = {"message": "Folder created", "result": serializer.data}
        return Response(response, status=200)


class FileView(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = FileSerializer
    queryset = File.objects.all()


class UserList(viewsets.ModelViewSet):
    permission_classes = (AllowAny,)
    serializer_class = UserSerializer
    queryset = User.objects.all()

    def create(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=HTTP_201_CREATED)
        return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)
