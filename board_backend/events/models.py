from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings


class User(AbstractUser):
    # Custom user model with role field
    VIEWER = 'viewer'
    HANDLER = 'handler'

    ROLE_CHOICES = [
        (VIEWER, 'Viewer'),
        (HANDLER, 'Handler'),
    ]

    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default=VIEWER)

    def is_viewer(self):
        return self.role == self.VIEWER

    def is_handler(self):
        return self.role == self.HANDLER


class Event(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    image = models.ImageField(upload_to='event_images/', null=True, blank=True)
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    host = models.CharField(max_length=255)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='events')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['date', 'start_time']
