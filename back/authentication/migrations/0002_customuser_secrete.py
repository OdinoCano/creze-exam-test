# Generated by Django 5.1.4 on 2024-12-23 02:03

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('authentication', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='customuser',
            name='secrete',
            field=models.CharField(blank=True, max_length=32, null=True),
        ),
    ]
