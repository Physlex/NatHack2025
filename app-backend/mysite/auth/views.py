from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.contrib.auth import authenticate
from .models import CustomUser, OTPToken, OAuthAccount
from .serializers import CustomUserSerializer, RegisterSerializer, LoginSerializer, OTPRequestSerializer, OTPVerifySerializer
from django.utils import timezone
import random
import string

# Create your views here.

def _generate_code(length=6):
    return ''.join(random.choice(string.digits) for _ in range(length))


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        ser = RegisterSerializer(data=request.data)
        if not ser.is_valid():
            return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)
        data = ser.validated_data
        if CustomUser.objects.filter(email=data['email']).exists():
            return Response({'detail': 'User already exists'}, status=status.HTTP_400_BAD_REQUEST)
        user = CustomUser.objects.create_user(email=data['email'], password=data['password'], name=data.get('name', ''))
        # Optionally send verification OTP here
        return Response(CustomUserSerializer(user).data, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        ser = LoginSerializer(data=request.data)
        if not ser.is_valid():
            return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)
        data = ser.validated_data
        user = authenticate(request, username=data['email'], password=data['password'])
        if not user:
            return Response({'detail': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        # For now return user data; integrate token/JWT later
        return Response(CustomUserSerializer(user).data)


class OTPRequestView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        ser = OTPRequestSerializer(data=request.data)
        if not ser.is_valid():
            return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)
        email = ser.validated_data['email']
        purpose = ser.validated_data.get('purpose', 'login')
        code = _generate_code(6)
        user = CustomUser.objects.filter(email=email).first()
        OTPToken.create_for_email(email=email, code=code, ttl_seconds=300, purpose=purpose, user=user)
        # TODO: send code via email
        return Response({'detail': 'OTP sent (development: not actually sent)'}, status=status.HTTP_200_OK)


class OTPVerifyView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        ser = OTPVerifySerializer(data=request.data)
        if not ser.is_valid():
            return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)
        email = ser.validated_data['email']
        code = ser.validated_data['code']
        purpose = ser.validated_data.get('purpose', 'login')
        token = OTPToken.objects.filter(email=email, code=code, purpose=purpose, used=False).order_by('-created_at').first()
        if not token or token.is_expired():
            return Response({'detail': 'Invalid or expired code'}, status=status.HTTP_400_BAD_REQUEST)
        token.mark_used()
        user = token.user
        if not user:
            # create user on signup/login if doesn't exist
            user = CustomUser.objects.create_user(email=email)
            user.is_verified = True
            user.save()
        # TODO: return auth token / session
        return Response(CustomUserSerializer(user).data)
