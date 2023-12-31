import uuid

from django.contrib.auth.models import User
from django.db import models
from django.utils.translation import gettext_lazy as _
from mptt.models import MPTTModel, TreeForeignKey


class Folder(MPTTModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="folders")

    name = models.CharField(
        verbose_name=_("Folder Name"),
        help_text=_("Required and unique"),
        max_length=50,
    )

    parent = TreeForeignKey(
        "self", on_delete=models.CASCADE, null=True, blank=True, related_name="children"
    )

    is_explorer = models.BooleanField(
        verbose_name=_("explorer"),
        help_text=_("Is Explorer Folder"),
        default=False,
        editable=False,
    )

    created_at = models.DateTimeField(
        _("Created at"), auto_now_add=True, editable=False
    )

    updated_at = models.DateTimeField(_("Updated at"), auto_now=True)

    def is_empty(self) -> bool:
        return self.is_leaf_node() and not self.files.all()

    class MPTTMeta:
        order_insertion_by = ["-created_at"]

    class Meta:
        verbose_name = _("Folder")
        verbose_name_plural = _("Folders")

    def __str__(self):
        return f"{self.name}"


class File(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="files")

    parent = models.ForeignKey(Folder, on_delete=models.CASCADE, related_name="files")

    name = models.CharField(
        verbose_name=_("name"), help_text=_("Required"), max_length=50
    )
    content = models.TextField(
        verbose_name=_("content"), help_text=_("file"), blank=True
    )
    is_published = models.BooleanField(
        verbose_name=_("publish"), help_text=_("Check Published"), default=False
    )

    created_at = models.DateTimeField(
        _("Created at"), auto_now_add=True, editable=False
    )

    updated_at = models.DateTimeField(_("Updated at"), auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = _("File")
        verbose_name_plural = _("Files")

    def __str__(self):
        return f"{self.name}"
