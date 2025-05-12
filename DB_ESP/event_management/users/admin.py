from django.contrib import admin
from .models import CustomUser, Handler, Viewer, Membership

class MembershipInline(admin.TabularInline):
    model = Membership
    fk_name = 'handler'
    extra = 1

@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ('id', 'username', 'email', 'user_type')
    list_filter = ('user_type',)
    search_fields = ('username', 'email')

@admin.register(Handler)
class HandlerAdmin(admin.ModelAdmin):
    list_display = ('id', 'username', 'email', 'society_name', 'join_code')
    search_fields = ('username', 'email', 'society_name')
    inlines = [MembershipInline]
    
    def get_queryset(self, request):
        # Only show users who are handlers
        return super().get_queryset(request).filter(user_type='handler')

@admin.register(Viewer)
class ViewerAdmin(admin.ModelAdmin):
    list_display = ('id', 'username', 'email', 'first_name', 'last_name')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    inlines = [MembershipInline]
    
    def get_queryset(self, request):
        # Only show users who are viewers
        return super().get_queryset(request).filter(user_type='viewer')

@admin.register(Membership)
class MembershipAdmin(admin.ModelAdmin):
    list_display = ('viewer', 'handler', 'role')
    list_filter = ('role',)
