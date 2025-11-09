from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone
import uuid


class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_verified', True)
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True')
        return self.create_user(email, password, **extra_fields)


class CustomUser(AbstractBaseUser, PermissionsMixin):
    PROVIDER_EMAIL = 'email'
    PROVIDER_GOOGLE = 'google'
    PROVIDER_GITHUB = 'github'
    PROVIDER_FACEBOOK = 'facebook'
    PROVIDER_APPLE = 'apple'
    PROVIDER_CHOICES = [
        (PROVIDER_EMAIL, 'Email'),
        (PROVIDER_GOOGLE, 'Google'),
        (PROVIDER_GITHUB, 'GitHub'),
        (PROVIDER_FACEBOOK, 'Facebook'),
        (PROVIDER_APPLE, 'Apple'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, null=False, blank=False)
    name = models.CharField(max_length=150, blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)
    auth_provider = models.CharField(max_length=30, choices=PROVIDER_CHOICES, default=PROVIDER_EMAIL)
    date_joined = models.DateTimeField(default=timezone.now)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.email


class OAuthAccount(models.Model):
    """
    Links a CustomUser to an OAuth provider account.
    Stores optional tokens and provider-specific UID.
    """
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='social_accounts')
    provider = models.CharField(max_length=30, choices=CustomUser.PROVIDER_CHOICES)
    provider_user_id = models.CharField(max_length=255)
    access_token = models.TextField(blank=True, null=True)
    refresh_token = models.TextField(blank=True, null=True)
    expires_at = models.DateTimeField(blank=True, null=True)
    extra_data = models.JSONField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('provider', 'provider_user_id')

    def __str__(self):
        return f"{self.provider} account for {self.user.email}"


class OTPToken(models.Model):
    """
    One-time password token for email sign-in, passwordless login, verification, or password reset.
    """
    PURPOSE_LOGIN = 'login'
    PURPOSE_SIGNUP = 'signup'
    PURPOSE_RESET = 'reset'
    PURPOSE_CHOICES = [
        (PURPOSE_LOGIN, 'Login'),
        (PURPOSE_SIGNUP, 'Signup'),
        (PURPOSE_RESET, 'Password Reset'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='otp_tokens', null=True, blank=True)
    email = models.EmailField(null=True, blank=True)
    code = models.CharField(max_length=10)
    purpose = models.CharField(max_length=20, choices=PURPOSE_CHOICES, default=PURPOSE_LOGIN)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    used = models.BooleanField(default=False)

    class Meta:
        indexes = [models.Index(fields=['email']), models.Index(fields=['user'])]

    def is_expired(self):
        return timezone.now() >= self.expires_at

    def mark_used(self):
        self.used = True
        self.save(update_fields=['used'])

    def __str__(self):
        target = self.email or (self.user.email if self.user else 'unknown')
        return f"OTP for {target} (purpose={self.purpose})"

    @classmethod
    def create_for_email(cls, email, code, ttl_seconds=300, purpose=PURPOSE_LOGIN, user=None):
        expires = timezone.now() + timezone.timedelta(seconds=ttl_seconds)
        return cls.objects.create(email=email, code=code, expires_at=expires, purpose=purpose, user=user)
