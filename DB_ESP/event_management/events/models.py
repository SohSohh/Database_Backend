# events/models.py
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
    # Add many-to-many relationship for attendees
    attendees = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='attending_events',
        blank=True
    )
    start_time = models.TimeField()
    end_time = models.TimeField()
    date = models.DateField()
    location = models.CharField(max_length=255)
    description = models.TextField()
    banner = models.ImageField(upload_to='event_banners/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    category = models.ForeignKey(
        'Category',
        on_delete=models.SET_NULL,
        related_name='events',
        null=True,
        blank=True
    )

    def __str__(self):
        return f"{self.name} on {self.date}"

    @property
    def attendee_count(self):
        """Return the count of attendees"""
        return self.attendees.count()

    class Meta:
        ordering = ['date', 'start_time']


class Category(models.Model):
    """Category model for classifying events"""
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Categories"
        ordering = ['name']


class Comment(models.Model):
    """Comment model for event feedback"""
    event = models.ForeignKey(
        Event,
        on_delete=models.CASCADE,
        related_name='comments'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='comments'
    )
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Comment by {self.user.username} on {self.event.name}"

    class Meta:
        ordering = ['-created_at']