from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .serializers import LoginSerializer, RegisterSerializer, UserSerializer


# ---------------------------------------------------------------------------
# Public routes (no login required)
# ---------------------------------------------------------------------------

@api_view(["GET"])
@permission_classes([AllowAny])
def home(request):
    """GET /  - a heartbeat so the frontend can tell the API is alive."""
    return Response({"message": "Welcome to the MataPool API!"})


@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    """POST /auth/register/  - create a new account."""
    serializer = RegisterSerializer(data=request.data)

    # raise_exception=True makes DRF automatically return a 400 with a
    # dictionary of {field_name: [error]}, which is the shape
    # Register.jsx already knows how to display.
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
    """POST /auth/login/  - exchange email + password for a token."""
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


# ---------------------------------------------------------------------------
# Protected routes (must send a token)
# ---------------------------------------------------------------------------

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout(request):
    """POST /auth/logout/  - throw the token away so it stops working."""
    Token.objects.filter(user=request.user).delete()
    return Response({"message": "Logged out."}, status=status.HTTP_200_OK)


@api_view(["GET", "PATCH"])
@permission_classes([IsAuthenticated])
def me(request):
    """GET or PATCH /auth/me/  - read or update the logged-in user."""
    if request.method == "GET":
        return Response(UserSerializer(request.user).data)

    # partial=True means the client can send just one field, e.g. {"bio": "hi"}
    serializer = UserSerializer(request.user, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()

    return Response(serializer.data)
