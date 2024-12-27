from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import CustomUser
import pyotp

class RegisterView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        email = request.data.get("email")
        user = CustomUser.objects.create_user(username=username, email=email, password=password)
        totp = pyotp.TOTP(user.mfa_secret, name=email, issuer="Creze")
        uri = totp.provisioning_uri(name=email, issuer_name="Creze")
        user.generate_mfa_secret()
        return Response({"detail": "User registered successfully!", "otp_uri": uri, "secret": user.mfa_secret}, status=status.HTTP_201_CREATED)

class LoginView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        user = authenticate(username=username, password=password)

        if user:
            refresh = RefreshToken.for_user(user)
            return Response({
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "mfa_enabled": user.is_mfa_enabled,
            })
        return Response({"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

class LogoutView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        try:
            # Descartar el refresh token enviado por el cliente
            refresh_token = request.data.get('refresh')
            token = RefreshToken(refresh_token)
            token.blacklist()  # Esto requiere que tengas un backend de blacklist configurado en settings.py
            request.user.disable_mfa()
            return Response({"detail": "Logout successful."}, status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class MFAValidationView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        user = request.user
        if not user.is_authenticated:
            user.disable_mfa()
            return Response({"detail": "Authentication credentials were not provided."}, status=status.HTTP_401_UNAUTHORIZED)

        token = request.data.get("token")
        if not token:
            return Response({"detail": "Token is required."}, status=status.HTTP_400_BAD_REQUEST)

        if user.verify_mfa_token(token):
            user.enable_mfa()
            return Response({"detail": "MFA validated successfully."}, status=status.HTTP_200_OK)
        else:
            return Response({"detail": "Invalid MFA token."}, status=status.HTTP_400_BAD_REQUEST)

class MFAGetSecretView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        user = request.user
        if not user.is_authenticated:
            user.disable_mfa()
            return Response({"detail": "Authentication credentials were not provided."}, status=status.HTTP_401_UNAUTHORIZED)

        if user.is_mfa_enabled:
            return Response({"detail": "MFA is already enabled for this user."}, status=status.HTTP_400_BAD_REQUEST)

        #totp = pyotp.TOTP(user.mfa_secret)
        #uri = totp.provisioning_uri(name=user.username, issuer_name="Creze")
        return Response({"detail": "MFA secret generated successfully.", "secret": user.mfa_secret}, status=status.HTTP_201_CREATED)

class UpdateUserView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        user = request.user
        if not user.is_authenticated:
            user.disable_mfa()
            return Response({"detail": "Authentication credentials were not provided."}, status=status.HTTP_401_UNAUTHORIZED)

        if not user.is_mfa_enabled:
            user.disable_mfa()
            return Response({"detail": "MFA is not enabled for this user."}, status=status.HTTP_400_BAD_REQUEST)
        
        data = request.data
        user.update_user(**data)
        return Response({"detail": "User updated successfully."}, status=status.HTTP_200_OK)

class DeleteUserView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        user = request.user
        if not user.is_authenticated:
            user.disable_mfa()
            return Response({"detail": "Authentication credentials were not provided."}, status=status.HTTP_401_UNAUTHORIZED)

        if not user.is_mfa_enabled:
            user.disable_mfa()
            return Response({"detail": "MFA is not enabled for this user."}, status=status.HTTP_400_BAD_REQUEST)
        
        user.delete_user()
        return Response({"detail": "User deleted successfully."}, status=status.HTTP_200_OK)

class ListUsersView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        user = request.user
        if not user.is_authenticated:
            user.disable_mfa()
            return Response({"detail": "Authentication credentials were not provided."}, status=status.HTTP_401_UNAUTHORIZED)

        if not user.is_mfa_enabled:
            user.disable_mfa()
            return Response({"detail": "MFA is not enabled for this user."}, status=status.HTTP_400_BAD_REQUEST)
        
        users = user.list_users()
        if users is None:
            return Response({"detail": "You are not authorized to perform this action."}, status=status.HTTP_403_FORBIDDEN)

        return Response({"detail": [user.username for user in users]}, status=status.HTTP_200_OK)
    
class GetUserInfo(APIView):
    def get(self, request):
        user = request.user
        if not user.is_authenticated:
            user.disable_mfa()
            return Response({"detail": "Authentication credentials were not provided."}, status=status.HTTP_401_UNAUTHORIZED)

        if not user.is_mfa_enabled:
            user.disable_mfa()
            return Response({"detail": "MFA is not enabled for this user."}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({"detail": user.get_info()}, status=status.HTTP_200_OK)
        
class RegenerateMFASecretView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        # Obtiene el usuario actual
        user = request.user

        if not user.is_authenticated:
            user.disable_mfa()
            return Response({"detail": "Authentication credentials were not provided."}, status=status.HTTP_401_UNAUTHORIZED)
        
        # Si el usuario tiene habilitada la MFA, regeneramos el secreto
        if user.is_mfa_enabled:
            user.generate_mfa_secret()
            totp = pyotp.TOTP(user.mfa_secret)
            uri = totp.provisioning_uri(name=user.email, issuer_name="Creze")
            return Response({"detail": "New MFA secret generated successfully.", "otp_uri": uri, "secret": user.mfa_secret}, status=status.HTTP_201_CREATED)
        else:
            return Response({"detail": "MFA is not enabled for this user."}, status=status.HTTP_400_BAD_REQUEST)
