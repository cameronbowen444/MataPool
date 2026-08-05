from django.contrib.auth import authenticate
from rest_framework import serializers

from .models import Event, EventGalleryImage, User
from .validators import validate_csun_email


class UserSerializer(serializers.ModelSerializer):
    """Turns a User object into JSON to send back to React.

    Passwords are never included in API responses.
    """

    class Meta:
        model = User
        fields = [
            "id",
            "first_name",
            "last_name",
            "email",
            "phone",
            "bio",
            "profile_picture",
            "profile_picture_alt",
        ]


class RegisterSerializer(serializers.ModelSerializer):
    """Validates registration data and creates a new user."""

    email = serializers.EmailField(
        validators=[validate_csun_email]
    )

    password = serializers.CharField(
        write_only=True,
        min_length=8,
    )

    password_confirm = serializers.CharField(
        write_only=True
    )

    class Meta:
        model = User
        fields = [
            "first_name",
            "last_name",
            "email",
            "password",
            "password_confirm",
        ]

    def validate_email(self, value):
        """Normalize the email and prevent duplicate accounts."""

        email = value.lower().strip()

        if User.objects.filter(
            email__iexact=email
        ).exists():
            raise serializers.ValidationError(
                "An account with this email already exists."
            )

        return email

    def validate(self, attrs):
        """Confirm that both password fields match."""

        if (
            attrs["password"]
            != attrs["password_confirm"]
        ):
            raise serializers.ValidationError(
                {
                    "password_confirm": (
                        "Passwords do not match."
                    ),
                }
            )

        return attrs

    def create(self, validated_data):
        """Create the user and securely hash the password."""

        validated_data.pop("password_confirm")

        password = validated_data.pop("password")

        # AbstractUser still requires a username.
        # MataPool uses the normalized email as the username.
        validated_data["username"] = (
            validated_data["email"]
        )

        user = User(**validated_data)

        user.set_password(password)
        user.save()

        return user


class LoginSerializer(serializers.Serializer):
    """Validates an email and password login attempt."""

    email = serializers.EmailField()

    password = serializers.CharField(
        write_only=True
    )

    def validate(self, attrs):
        """Authenticate the user using email as the username."""

        email = attrs["email"].lower().strip()
        password = attrs["password"]

        user = authenticate(
            username=email,
            password=password,
        )

        if user is None:
            raise serializers.ValidationError(
                {
                    "general": (
                        "Incorrect email or password."
                    ),
                }
            )

        if not user.is_active:
            raise serializers.ValidationError(
                {
                    "general": (
                        "This account has been deactivated."
                    ),
                }
            )

        attrs["user"] = user

        return attrs


class EventGalleryImageSerializer(
    serializers.ModelSerializer
):
    """Serializes one image in an event gallery."""

    class Meta:
        model = EventGalleryImage
        fields = [
            "id",
            "image",
            "uploaded_at",
        ]


class EventSerializer(serializers.ModelSerializer):
    """Serializes events and their gallery images."""

    creator = UserSerializer(
        read_only=True
    )

    gallery_images = EventGalleryImageSerializer(
        many=True,
        read_only=True,
    )

    class Meta:
        model = Event
        fields = [
            "id",
            "title",
            "description",
            "location",
            "date",
            "time",
            "banner_image",
            "gallery_images",
            "creator",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "creator",
            "gallery_images",
            "created_at",
            "updated_at",
        ]


class PublicProfileSerializer(serializers.ModelSerializer):
    """Public-facing view of another user's profile.

    Exposes only non-sensitive fields (no email or phone), plus an
    activity count. `event_count` is the number of events this user has
    created. Carpool stats (pickups, requests) will be added here once
    the carpool feature exists.
    """

    event_count = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "first_name",
            "last_name",
            "bio",
            "profile_picture",
            "profile_picture_alt",
            "event_count",
        ]

    def get_event_count(self, obj):
        # Event.creator uses related_name="events".
        return obj.events.count()