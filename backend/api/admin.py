from django.contrib import admin
from mptt.admin import DraggableMPTTAdmin

from .models import File, Folder

# Register your models here.
admin.site.register(
    Folder,
    DraggableMPTTAdmin,
    list_display=(
        "tree_actions",
        "indented_title",
        # ...more fields if you feel like it...
    ),
    list_display_links=("indented_title",),
)

admin.site.register(File)

# Register your models here.
