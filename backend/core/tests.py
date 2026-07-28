from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import User


class RegisterTests(APITestCase):
    """Run these with:  python manage.py test"""

    def valid_payload(self, **overrides):
        data = {
            "first_name": "Ava",
            "last_name": "Lopez",
            "email": "ava.lopez@my.csun.edu",
            "username": "ava.lopez@my.csun.edu",
            "password": "matapool123",
            "password_confirm": "matapool123",
        }
        data.update(overrides)
        return data

    def test_valid_registration_creates_user(self):
        response = self.client.post(
            reverse("register"), self.valid_payload(), format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(email="ava.lopez@my.csun.edu").exists())

    def test_password_is_hashed_not_stored_plainly(self):
        self.client.post(reverse("register"), self.valid_payload(), format="json")
        user = User.objects.get(email="ava.lopez@my.csun.edu")

        self.assertNotEqual(user.password, "matapool123")
        self.assertTrue(user.check_password("matapool123"))

    def test_non_csun_email_is_rejected(self):
        response = self.client.post(
            reverse("register"),
            self.valid_payload(email="ava@gmail.com", username="ava@gmail.com"),
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", response.data)

    def test_mismatched_passwords_are_rejected(self):
        response = self.client.post(
            reverse("register"),
            self.valid_payload(password_confirm="different123"),
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("password_confirm", response.data)


class LoginTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="ava.lopez@my.csun.edu",
            email="ava.lopez@my.csun.edu",
            password="matapool123",
            first_name="Ava",
            last_name="Lopez",
        )

    def test_login_returns_token(self):
        response = self.client.post(
            reverse("login"),
            {"email": "ava.lopez@my.csun.edu", "password": "matapool123"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("token", response.data)

    def test_wrong_password_is_rejected(self):
        response = self.client.post(
            reverse("login"),
            {"email": "ava.lopez@my.csun.edu", "password": "wrong"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_me_requires_authentication(self):
        response = self.client.get(reverse("me"))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
