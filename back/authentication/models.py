from django.contrib.auth.models import AbstractUser
from django.db import models
import pyotp

class CustomUser(AbstractUser):
    is_mfa_enabled = models.BooleanField(default=False)
    mfa_secret = models.CharField(max_length=32, blank=True, null=True)

    def generate_mfa_secret(self):
        secret = pyotp.random_base32()
        while CustomUser.objects.filter(mfa_secret=secret).exists():
            secret = pyotp.random_base32()
        self.mfa_secret = secret
        self.save()

    def verify_mfa_token(self, token):
        totp = pyotp.TOTP(self.mfa_secret)
        return totp.verify(token)
    
    def get_mfa_secret(self):
        return self.mfa_secret
    
    def get_mfa_status(self):
        return self.is_mfa_enabled
    
    def get_info(self):
        return {
            "username": self.username,
            "email": self.email,
            "is_mfa_enabled": self.is_mfa_enabled,
            "mfa_secret": self.mfa_secret,
        }
    
    def update_user(self, **kwargs):
        for key, value in kwargs.items():
            setattr(self, key, value)
        self.save()

    def delete_user(self):
        self.delete()

    def list_users(self):
        if not self.is_superuser:
            return None
        return CustomUser.objects.all()
    
    def enable_mfa(self):
        self.is_mfa_enabled = True
        self.save()
    
    def disable_mfa(self):
        self.is_mfa_enabled = False