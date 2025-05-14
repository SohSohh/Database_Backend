from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, HandlerApplication, Handler, Viewer, Membership
from django.utils.html import format_html
from django.urls import reverse
from django.contrib import messages
from django.db.models import Count

# Register the standard user models
admin.site.register(CustomUser, UserAdmin)
admin.site.register(Membership)


@admin.register(Handler)
class HandlerAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'society_name', 'join_code', 'date_joined', 'member_count')
    list_filter = ('date_joined',)
    search_fields = ('username', 'email', 'society_name')
    readonly_fields = ('date_joined', 'join_code')
    
    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.annotate(member_count=Count('viewer_memberships'))
        
    def member_count(self, obj):
        return obj.member_count
    
    member_count.admin_order_field = 'member_count'
    member_count.short_description = 'Number of Members'


@admin.register(HandlerApplication)
class HandlerApplicationAdmin(admin.ModelAdmin):
    list_display = ('society_name', 'username', 'email', 'created_at', 'status', 'application_actions')
    list_filter = ('status', 'created_at')
    search_fields = ('society_name', 'username', 'email')
    readonly_fields = ('created_at',)
    
    def application_actions(self, obj):
        if obj.status == HandlerApplication.STATUS_PENDING:
            approve_url = reverse('admin:approve_application', args=[obj.pk])
            deny_url = reverse('admin:deny_application', args=[obj.pk])
            return format_html(
                '<a class="button" href="{}">Approve</a>&nbsp;'
                '<a class="button" style="background-color: #e74c3c;" href="{}">Deny</a>',
                approve_url, deny_url
            )
        return format_html('<span>-</span>')
    
    application_actions.short_description = 'Actions'
    
    def get_urls(self):
        from django.urls import path
        urls = super().get_urls()
        custom_urls = [
            path('approve/<int:application_id>/', self.admin_site.admin_view(self.approve_application), name='approve_application'),
            path('deny/<int:application_id>/', self.admin_site.admin_view(self.deny_application), name='deny_application'),
        ]
        return custom_urls + urls
    
    def approve_application(self, request, application_id):
        from .views import send_application_email
        
        try:
            application = HandlerApplication.objects.get(id=application_id, status=HandlerApplication.STATUS_PENDING)
            
            # Create the handler user
            handler = Handler.objects.create_user(
                username=application.username,
                email=application.email,
                password=application.password,
                society_name=application.society_name
            )
            
            # Generate join code
            handler.generate_code()
            
            # Update application status
            application.status = HandlerApplication.STATUS_APPROVED
            application.save()
            
            # Send approval email
            send_application_email(application, is_approved=True)
            
            self.message_user(
                request, 
                f"Successfully approved application for {application.society_name} and created handler account.",
                messages.SUCCESS
            )
        except HandlerApplication.DoesNotExist:
            self.message_user(
                request, 
                "Application not found or already processed.",
                messages.ERROR
            )
        except Exception as e:
            self.message_user(
                request, 
                f"Error approving application: {str(e)}",
                messages.ERROR
            )
        
        return self.redirect_to_applications_list(request)
    
    def deny_application(self, request, application_id):
        from .views import send_application_email
        
        try:
            application = HandlerApplication.objects.get(id=application_id, status=HandlerApplication.STATUS_PENDING)
            
            # Update application status
            application.status = HandlerApplication.STATUS_DENIED
            application.save()
            
            # Send denial email
            send_application_email(application, is_approved=False)
            
            self.message_user(
                request, 
                f"Application for {application.society_name} has been denied.",
                messages.SUCCESS
            )
        except HandlerApplication.DoesNotExist:
            self.message_user(
                request, 
                "Application not found or already processed.",
                messages.ERROR
            )
        except Exception as e:
            self.message_user(
                request, 
                f"Error denying application: {str(e)}",
                messages.ERROR
            )
        
        return self.redirect_to_applications_list(request)
    
    def redirect_to_applications_list(self, request):
        from django.http import HttpResponseRedirect
        return HttpResponseRedirect(reverse('admin:users_handlerapplication_changelist'))
