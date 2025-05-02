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
    max_attendees = models.PositiveIntegerField(null=True, blank=True)
    is_important = models.BooleanField(default=False)
    require_registration = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} on {self.date}"

    @property
    def attendee_count(self):
        """Return the count of attendees"""
        return self.attendees.count()

    class Meta:
        ordering = ['date', 'start_time']


class Feedback(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='feedbacks')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    rating = models.PositiveIntegerField(choices=[(i, i) for i in range(1, 6)])
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['event', 'user']  # One feedback per user per event

    def __str__(self):
        return f"{self.user.username}'s feedback for {self.event.name}"