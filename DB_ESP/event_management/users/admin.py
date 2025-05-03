from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Handler, Viewer


class MembershipInline(admin.TabularInline):
    model = Viewer.memberships.through
    fk_name = 'to_customuser'
    verbose_name = 'Member'
    verbose_name_plural = 'Members'
    extra = 1


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'user_type', 'is_staff')
    list_filter = ('user_type', 'is_staff', 'is_superuser')
    search_fields = ('username', 'email')

    fieldsets = UserAdmin.fieldsets + (
        ('User Type', {'fields': ('user_type',)}),
    )


@admin.register(Handler)
class HandlerAdmin(UserAdmin):
    list_display = ('username', 'email', 'society_name', 'join_code')
    search_fields = ('username', 'email', 'society_name')

    fieldsets = UserAdmin.fieldsets + (
        ('Handler Info', {'fields': ('society_name', 'join_code')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Handler Info', {'fields': ('society_name',)}),
    )

    # Add regenerate join code action
    actions = ['regenerate_join_codes']
    inlines = [MembershipInline]

    def regenerate_join_codes(self, request, queryset):
        count = 0
        for user in queryset:
            user.generate_code()
            count += 1
        self.message_user(request, f"Successfully regenerated join codes for {count} handlers.")

    regenerate_join_codes.short_description = "Regenerate join codes for selected handlers"


@admin.register(Viewer)
class ViewerAdmin(UserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name')
    search_fields = ('username', 'email', 'first_name', 'last_name')
