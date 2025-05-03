from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _
import random


class CustomUser(AbstractUser):
    """Custom User model with email as username field"""
    email = models.EmailField(_('email address'), unique=True)
    society_name = models.CharField(max_length=255, blank=True, null=True)
    join_code = models.CharField(max_length=5, blank=True, null=True)

    # Define user types
    VIEWER = 'viewer'
    HANDLER = 'handler'
    USER_TYPE_CHOICES = [
        (VIEWER, 'Viewer'),
        (HANDLER, 'Handler'),
    ]

    user_type = models.CharField(
        max_length=10,
        choices=USER_TYPE_CHOICES,
        default=VIEWER,
    )

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def generate_code(self):
        code = ''.join(str(random.randint(0, 9)) for _ in range(0, 5))
        self.join_code = code
        self.save()
        return code

    def is_handler(self):
        """Return whether this user is a handler"""
        return self.user_type == self.HANDLER

    def is_viewer(self):
        """Return whether this user is a viewer"""
        return self.user_type == self.VIEWER

    def __str__(self):
        if self.user_type == self.HANDLER:
            return self.society_name or self.username
        return f"{self.first_name} {self.last_name}" if self.first_name else self.username

class Handler(CustomUser):
    class Meta:
        proxy = True

    def save(self, *args, **kwargs):
        if not self.pk:
            self.user_type = self.HANDLER
        super().save(*args, **kwargs)

    @property
    def members(self):
        """Get all viewers who are members of this handler"""
        return Viewer.objects.filter(society_memberships__handler=self)


class Viewer(CustomUser):
    class Meta:
        proxy = True

    def save(self, *args, **kwargs):
        if not self.pk:
            self.user_type = self.VIEWER
        super().save(*args, **kwargs)

    @property
    def societies(self):
        """Get all handlers this viewer is a member of"""
        return Handler.objects.filter(viewer_memberships__viewer=self)


class Membership(models.Model):
    """Intermediate model to track society memberships with roles"""
    EXECUTIVE = 'executive'
    DEPUTY_DIRECTOR = 'deputy_director'
    DIRECTOR = 'director'
    VICE_PRESIDENT = 'vice_president'
    PRESIDENT = 'president'
    OTHER = 'other'

    ROLE_CHOICES = [
        (EXECUTIVE, 'Executive'),
        (DEPUTY_DIRECTOR, 'Deputy Director'),
        (DIRECTOR, 'Director'),
        (VICE_PRESIDENT, 'Vice President'),
        (PRESIDENT, 'President'),
        (OTHER, 'Other'),
    ]

    viewer = models.ForeignKey('Viewer', related_name='society_memberships', on_delete=models.CASCADE)
    handler = models.ForeignKey('Handler', related_name='viewer_memberships', on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default=OTHER)

    class Meta:
        unique_together = ('viewer', 'handler')