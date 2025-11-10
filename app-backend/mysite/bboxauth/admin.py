from django.contrib import admin
from .models import CustomUser

# Register your models here.
@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'is_active', 'is_staff')
    search_fields = ('name', 'email')
    readonly_fields = ('date_joined', 'last_login')