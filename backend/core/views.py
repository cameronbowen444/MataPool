import os

from django.contrib.auth import get_user_model
from google.auth.transport import requests
from google.oauth2 import id_token
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Event, EventGalleryImage
from .serializers import (
    EventSerializer,
    LoginSerializer,
    RegisterSerializer,
    UserSerializer,
)


User = get_user_model()

GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID")


# ---------------------------------------------------------------------------
# Public routes
# ---------------------------------------------------------------------------

@api_view(["GET"])
@permission_classes([AllowAny])
def home(request):
    """GET / - confirm that the MataPool API is running."""
    return Response({
        "message": "Welcome to the MataPool API!"
    })


# ---------------------------------------------------------------------------
# Event routes
# ---------------------------------------------------------------------------

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def event_list(request):
    """
    GET /events/ - list all events.
    POST /events/ - create a new event.
    """

    if request.method == "GET":
        events = Event.objects.all().order_by("-created_at")
        serializer = EventSerializer(
            events,
            many=True,
            context={"request": request},
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )

    serializer = EventSerializer(
        data=request.data,
        context={"request": request},
    )

    serializer.is_valid(raise_exception=True)

    event = serializer.save(
        creator=request.user,
    )

    for image in request.FILES.getlist("gallery_images"):
        EventGalleryImage.objects.create(
            event=event,
            image=image,
        )

    return Response(
        EventSerializer(
            event,
            context={"request": request},
        ).data,
        status=status.HTTP_201_CREATED,
    )


@api_view(["GET", "PUT", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def event_detail(request, id):
    """
    GET /events/<id>/ - retrieve an event.
    PUT/PATCH /events/<id>/ - update an event.
    DELETE /events/<id>/ - delete an event.
    """

    try:
        event = Event.objects.get(id=id)
    except Event.DoesNotExist:
        return Response(
            {"error": "Event not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    if request.method == "GET":
        serializer = EventSerializer(
            event,
            context={"request": request},
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )

    if event.creator != request.user:
        return Response(
            {
                "error": (
                    "You do not have permission to modify this event."
                )
            },
            status=status.HTTP_403_FORBIDDEN,
        )

    if request.method in ["PUT", "PATCH"]:
        serializer = EventSerializer(
            event,
            data=request.data,
            partial=request.method == "PATCH",
            context={"request": request},
        )

        serializer.is_valid(raise_exception=True)

        event = serializer.save()

        for image in request.FILES.getlist("gallery_images"):
            EventGalleryImage.objects.create(
                event=event,
                image=image,
            )

        return Response(
            EventSerializer(
                event,
                context={"request": request},
            ).data,
            status=status.HTTP_200_OK,
        )

    event.delete()

    return Response(
        status=status.HTTP_204_NO_CONTENT,
    )


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def event_gallery_image_delete(request, id):
    """
    DELETE /events/gallery/<id>/ - delete a specific gallery image.
    """

    try:
        gallery_image = EventGalleryImage.objects.get(id=id)
    except EventGalleryImage.DoesNotExist:
        return Response(
            {"error": "Image not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    if gallery_image.event.creator != request.user:
        return Response(
            {
                "error": (
                    "You do not have permission to delete this image."
                )
            },
            status=status.HTTP_403_FORBIDDEN,
        )

    gallery_image.delete()

    return Response(
        status=status.HTTP_204_NO_CONTENT,
    )


# ---------------------------------------------------------------------------
# Authentication routes
# ---------------------------------------------------------------------------

@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    """POST /auth/register/ - create a new account."""
    serializer = RegisterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    user = serializer.save()
    token, _ = Token.objects.get_or_create(user=user)

    return Response(
        {
            "user": UserSerializer(user).data,
            "token": token.key,
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):
    """POST /auth/login/ - log in with email and password."""
    serializer = LoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    user = serializer.validated_data["user"]
    token, _ = Token.objects.get_or_create(user=user)

    return Response(
        {
            "user": UserSerializer(user).data,
            "token": token.key,
        },
        status=status.HTTP_200_OK,
    )


class GoogleAuthView(APIView):
    """POST /auth/google/ - log in with a CSUN Google account."""

    permission_classes = [AllowAny]

    def post(self, request):
        google_token = request.data.get("token")

        if not google_token:
            return Response(
                {"error": "Google token is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not GOOGLE_CLIENT_ID:
            return Response(
                {"error": "Google authentication is not configured."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        try:
            id_info = id_token.verify_oauth2_token(
                google_token,
                requests.Request(),
                GOOGLE_CLIENT_ID,
            )

            email = id_info.get("email", "").strip().lower()
            hosted_domain = id_info.get("hd", "").strip().lower()
            email_verified = id_info.get("email_verified", False)

            if "@" not in email:
                return Response(
                    {
                        "error": (
                            "Google account did not provide a valid email."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            _, domain = email.rsplit("@", 1)

            if (
                domain != "my.csun.edu"
                or hosted_domain != "my.csun.edu"
                or not email_verified
            ):
                return Response(
                    {
                        "error": (
                            "Access denied. You must use a verified "
                            "@my.csun.edu email address."
                        )
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    "username": email,
                    "first_name": id_info.get("given_name", ""),
                    "last_name": id_info.get("family_name", ""),
                },
            )

            token, _ = Token.objects.get_or_create(user=user)

            return Response(
                {
                    "message": "Google login successful.",
                    "created": created,
                    "user": UserSerializer(user).data,
                    "token": token.key,
                },
                status=status.HTTP_200_OK,
            )

        except ValueError:
            return Response(
                {"error": "Invalid or expired Google token."},
                status=status.HTTP_400_BAD_REQUEST,
            )


# ---------------------------------------------------------------------------
# Protected routes
# ---------------------------------------------------------------------------

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout(request):
    """POST /auth/logout/ - delete the user's authentication token."""
    Token.objects.filter(user=request.user).delete()

    return Response(
        {"message": "Logged out."},
        status=status.HTTP_200_OK,
    )


@api_view(["GET", "PATCH"])
@permission_classes([IsAuthenticated])
def me(request):
    """GET or PATCH /auth/me/ - retrieve or update the current user."""
    if request.method == "GET":
        return Response(
            UserSerializer(
                request.user,
                context={"request": request},
            ).data
        )

    serializer = UserSerializer(
        request.user,
        data=request.data,
        partial=True,
        context={"request": request},
    )
    serializer.is_valid(raise_exception=True)
    serializer.save()

    return Response(serializer.data)


# ---------------------------------------------------------------------------
# Carpool routes
# ---------------------------------------------------------------------------

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def carpool_list(request):
    """GET /carpools/ - retrieve all available carpools."""
    pass


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def carpool_create(request):
    """POST /carpools/create/ - create a new carpool."""
    pass


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def carpool_detail(request, id):
    """GET /carpools/<id>/ - retrieve a specific carpool."""
    pass


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def carpool_join(request, id):
    """POST /carpools/<id>/join/ - join an existing carpool."""
    pass


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_matches(request):
    """GET /matches/ - retrieve matches for the current user."""
    pass