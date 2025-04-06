from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _


class CustomUser(AbstractUser):
    """Custom User model with email as username field"""
    email = models.EmailField(_('email address'), unique=True)

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
        default=VIEWER,  # Users are viewers by default
    )

    USERNAME_FIELD = 'email'  # Use email for login
    REQUIRED_FIELDS = ['username']  # Username still required but not for login

    def is_handler(self):
        """Check if user is a handler"""
        return self.user_type == self.HANDLER

    def __str__(self):
        return self.username