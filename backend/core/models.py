from django.contrib.auth.models import AbstractUser
from django.db import models


# ---------------------------------------------------------------------------
# User
#
# We inherit from AbstractUser instead of models.Model. That gives us
# username, first_name, last_name, email, password (already hashed for us),
# is_active, is_staff, last_login, and date_joined for free.
#
# We only add the fields Django doesn't already provide.
# ---------------------------------------------------------------------------
class User(AbstractUser):
    # AbstractUser has an email field, but it is not unique by default.
    # We override it so two people can't register with the same address.
    email = models.EmailField(unique=True)

    # Extra profile info for MataPool. blank=True means "optional in forms".
    phone = models.CharField(max_length=20, blank=True)
    bio = models.TextField(blank=True, default="")

    # Profile picture stored as a file under MEDIA_ROOT/profile_pictures/.
    profile_picture = models.ImageField(
        upload_to="profile_pictures/",
        blank=True,
        null=True,
    )
    # Alt text so screen reader users get a description of the image.
    profile_picture_alt = models.CharField(max_length=255, blank=True, default="")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        # Controls how a user shows up in the Django admin and in the shell.
        return f"{self.first_name} {self.last_name} ({self.email})"
