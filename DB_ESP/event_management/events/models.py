# events/models.py
from django.db import models
from django.conf import settings
import datetime


class Event(models.Model):
    """Event model representing an event in the system"""
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    # Host is the user who created the event
    host = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='hosted_events',
        limit_choices_to={'user_type': 'handler'}  # Add this to ensure only handlers can host
    )
    # Add many-to-many relationship for attendees
    attendees = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='attending_events',
        limit_choices_to={'user_type': 'viewer'},  # Add this to ensure only viewers can attend
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

    @property
    def average_rating(self):
        """Calculate and return the average rating for this event"""
        comments = self.comments.all()
        if not comments:
            return 0
        total_rating = sum(comment.rating for comment in comments)
        return round(total_rating / comments.count(), 1)

    def has_ended(self):
        """Check if the event has ended"""
        from django.utils import timezone
        import datetime

        event_end_datetime = datetime.datetime.combine(
            self.date,
            self.end_time,
            tzinfo=timezone.get_current_timezone()
        )

        return timezone.now() > event_end_datetime

    class Meta:
        ordering = ['date', 'start_time']

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
    rating = models.PositiveSmallIntegerField(choices=[(i, i) for i in range(1, 6)], default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Comment by {self.user.username} on {self.event.name}"

    def clean(self):
        """Validate that comment is only added after event has ended"""
        from django.core.exceptions import ValidationError
        from django.utils import timezone

        event_end_datetime = datetime.datetime.combine(
            self.event.date,
            self.event.end_time,
            tzinfo=timezone.get_current_timezone()
        )

        # Check if current time is after event end time
        if timezone.now() < event_end_datetime:
            raise ValidationError('Comments can only be added after the event has ended.')

    def save(self, *args, **kwargs):
        """Call clean before saving"""
        self.clean()
        super().save(*args, **kwargs)

    class Meta:
        ordering = ['-created_at']

