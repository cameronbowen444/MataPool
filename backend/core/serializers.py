from django.contrib.auth import authenticate
from rest_framework import serializers

from .models import User
from .validators import validate_csun_email


class UserSerializer(serializers.ModelSerializer):
    """Turns a User object into JSON to send back to React.

    Note there is no password field here - we never send passwords out.
    """

    class Meta:
        model = User
        fields = ["id", "first_name", "last_name", "email", "phone", "bio"]


class RegisterSerializer(serializers.ModelSerializer):
    """Checks the sign-up data, then creates the User.

    The field names below match exactly what Register.jsx sends.
    """

    email = serializers.EmailField(validators=[validate_csun_email])
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "first_name",
            "last_name",
            "email",
            "username",
            "password",
            "password_confirm",
        ]

    def validate_email(self, value):
        # Normalize to lowercase so Bob@ and bob@ are treated as one person.
        value = value.lower().strip()

        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "An account with this email already exists."
            )

        return value

    def validate(self, attrs):
        # validate() runs after the individual field checks and is where you
        # compare two fields against each other.
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError(
                {"password_confirm": "Passwords do not match."}
            )

        return attrs

    def create(self, validated_data):
        # password_confirm was only needed for the check above.
        validated_data.pop("password_confirm")
        password = validated_data.pop("password")

        # The frontend sends username = email, but default it just in case.
        validated_data.setdefault("username", validated_data["email"])

        user = User(**validated_data)

        # set_password() hashes the password. NEVER assign user.password
        # directly - that would store it in plain text.
        user.set_password(password)
        user.save()

        return user


class LoginSerializer(serializers.Serializer):
    """Not tied to a model - it just validates an email/password pair."""

    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs["email"].lower().strip()

        # authenticate() checks the hashed password for us.
        # Our USERNAME_FIELD is username, and username == email at signup.
        user = authenticate(username=email, password=attrs["password"])

        if user is None:
            raise serializers.ValidationError(
                {"general": "Incorrect email or password."}
            )

        if not user.is_active:
            raise serializers.ValidationError(
                {"general": "This account has been deactivated."}
            )

        attrs["user"] = user
        return attrs
