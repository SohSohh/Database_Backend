from django.db import models
from django.conf import settings

class Event(models.Model):
    """Event model representing an event in the system"""
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    # Host is the user who created the event
    host = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='hosted_events'
    )
    start_time = models.TimeField()
    end_time = models.TimeField()
    date = models.DateField()
    location = models.CharField(max_length=255)
    description = models.TextField()
    banner = models.ImageField(upload_to='event_banners/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} on {self.date}"

    class Meta:
        ordering = ['date', 'start_time']