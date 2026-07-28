from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from google.oauth2 import id_token
from google.auth.transport import requests
from django.contrib.auth import get_user_model

User = get_user_model()
GOOGLE_CLIENT_ID = "658977310896-knrl3gka66fldh83dao2rhgbblmd4un9.apps.googleusercontent.com"

# / route (dashboard basically, we will add redirect from login if token not active)
@api_view(["GET"])
def home(request):
    return Response({
        "message": "Welcome to the MataPool API!"
    })

# Google OAuth Login View for @my.csun.edu
class GoogleAuthView(APIView):
    def post(self, request):
        token = request.data.get('token')
        if not token:
            return Response({'error': 'Token is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # 1. Verify the ID token using Google's official library
            id_info = id_token.verify_oauth2_token(token, requests.Request(), GOOGLE_CLIENT_ID)

            # 2. Extract and strictly check email domain & Google Workspace hosted domain (hd)
            email = id_info.get('email', '').strip().lower()
            hosted_domain = id_info.get('hd', '')

            # Both domain check and 'hd' claim must match 'my.csun.edu'
            local_part, domain = email.rsplit('@', 1) if '@' in email else ('', '')
            
            if domain != 'my.csun.edu' or hosted_domain != 'my.csun.edu':
                return Response(
                    {'error': 'Access denied. You must use a valid @my.csun.edu email address.'},
                    status=status.HTTP_403_FORBIDDEN
                )

            # 3. Get or create the user in Django
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'username': email,
                    'first_name': id_info.get('given_name', ''),
                    'last_name': id_info.get('family_name', '')
                }
            )

            # 4. Return user info / session / auth token
            return Response({
                'message': 'Login successful',
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'first_name': user.first_name
                }
            }, status=status.HTTP_200_OK)

        except ValueError:
            # Invalid token
            return Response({'error': 'Invalid Google token.'}, status=status.HTTP_400_BAD_REQUEST)