# Generated by Django 4.2.4 on 2023-08-18 03:14

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('base', '0001_initial'),
    ]

    operations = [
        migrations.RenameField(
            model_name='file',
            old_name='file',
            new_name='content',
        ),
    ]
