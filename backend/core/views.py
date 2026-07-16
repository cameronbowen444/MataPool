from django.shortcuts import render

from rest_framework.decorators import api_view
from rest_framework.response import Response

#ADD VIEWS HERE

# / route (dashboard basically, we will add redirect from login if token not active)

@api_view(["GET"])
def home(request):
    return Response({
        "message": "Welcome to the MataPool API!"
    })