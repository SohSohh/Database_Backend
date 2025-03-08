from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Event

class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'role', 'is_staff')
    list_filter = ('role', 'is_staff', 'is_superuser')
    fieldsets = UserAdmin.fieldsets + (
        ('Role Information', {'fields': ('role',)}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Role Information', {'fields': ('role',)}),
    )

admin.site.register(User, CustomUserAdmin)

class EventAdmin(admin.ModelAdmin):
    list_display = ('title', 'date', 'host', 'created_by')
    list_filter = ('date', 'host')
    search_fields = ('title', 'description', 'host')

admin.site.register(Event, EventAdmin)