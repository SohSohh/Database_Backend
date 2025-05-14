from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.db.models import Count
from rest_framework.decorators import action
from django.db.models import Subquery, OuterRef, Count, F, Value, CharField
from django.db.models.functions import Concat
from django.db import models
from django.core.mail import send_mail
from django.conf import settings
from .models import CustomUser, Handler, Viewer, Membership, HandlerApplication
from .serializers import (
    HandlerSerializer,
    ViewerSerializer,
    CustomTokenObtainPairSerializer,
    ViewerRegistrationSerializer,
    HandlerRegistrationSerializer,
    HandlerApplicationSerializer,
    SocietyMembershipSerializer,
    JoinCodeSerializer, MemberWithRoleSerializer, HandlerProfileUpdateSerializer,
    ViewerProfileUpdateSerializer, HandlerWithRoleSerializer
)
from .permissions import IsHandler, IsViewer


def send_application_email(application, is_approved):
    """Send email notification for handler application status"""
    subject = f"Handler Application for {application.society_name} - {'Approved' if is_approved else 'Denied'}"
    
    if is_approved:
        message = f"""
        Hello {application.username},
        
        We are pleased to inform you that your application to register {application.society_name} as a handler has been approved.
        
        You can now log in using your email address {application.email} and the password you provided during registration.
        
        Thank you for joining our platform!
        """
    else:
        message = f"""
        Hello {application.username},
        
        We regret to inform you that your application to register {application.society_name} as a handler has been denied.
        
        If you believe this is an error or would like more information, please contact our support team.
        
        Thank you for your interest in our platform.
        """
    
    from_email = settings.DEFAULT_FROM_EMAIL
    recipient_list = [application.email]
    
    try:
        send_mail(subject, message, from_email, recipient_list, fail_silently=False)
        return True
    except Exception as e:
        print(f"Failed to send email: {str(e)}")
        return False


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class ViewerRegistrationView(generics.CreateAPIView):
    queryset = Viewer.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = ViewerRegistrationSerializer


class HandlerApplicationView(generics.CreateAPIView):
    """
    View for submitting applications to become a handler
    Replaces direct handler registration with an application process
    """
    queryset = HandlerApplication.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = HandlerApplicationSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response({
            "detail": "Your application has been submitted and is pending review. You will be notified by email when it's processed."
        }, status=status.HTTP_201_CREATED)


class HandlerApplicationListView(generics.ListAPIView):
    """View for admin users to list handler applications"""
    queryset = HandlerApplication.objects.filter(status=HandlerApplication.STATUS_PENDING)
    serializer_class = HandlerApplicationSerializer
    permission_classes = (permissions.IsAdminUser,)
    

class SocietyListView(generics.ListAPIView):
    serializer_class = HandlerSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        # Use a subquery to correctly count how many viewers have this handler in their memberships
        subquery = CustomUser.objects.filter(
            society_memberships=OuterRef('pk'),
            user_type='viewer'
        ).values('id')

        return Handler.objects.annotate(
            member_count=Count(
                Subquery(subquery),
                distinct=True
            )
        )


class MembershipView(APIView):
    permission_classes = (permissions.IsAuthenticated, IsViewer)

    def post(self, request):
        serializer = SocietyMembershipSerializer(data=request.data)
        if serializer.is_valid():
            handler = serializer.validated_data['handler']
            role = serializer.validated_data.get('role', Membership.OTHER)

            # Create or update membership
            membership, created = Membership.objects.update_or_create(
                viewer=request.user,
                handler=handler,
                defaults={'role': role}
            )

            return Response({"message": "Successfully joined society"}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SocietyMembersViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ViewerSerializer
    permission_classes = (permissions.IsAuthenticated, IsHandler)

    def get_serializer_class(self):
        return MemberWithRoleSerializer

    def get_queryset(self):
        handler = self.request.user
        # Get all viewers who are members of this handler with their roles
        return Viewer.objects.filter(society_memberships__handler=handler).annotate(
            society_memberships__role=models.F('society_memberships__role'),
            society_memberships__get_role_display=models.Case(
                *[models.When(society_memberships__role=choice[0], then=models.Value(choice[1]))
                  for choice in Membership.ROLE_CHOICES],
                default=models.Value('Unknown'),
                output_field=models.CharField(),
            )
        )

    @action(detail=False, methods=['post'], permission_classes=[IsHandler])
    def add_member(self, request):
        """
        Allows a handler to add a member to their society.
        """
        viewer_id = request.data.get('viewer_id')
        role = request.data.get('role', Membership.OTHER)

        # Validate viewer existence
        viewer = get_object_or_404(Viewer, id=viewer_id)

        # Validate role
        valid_roles = [choice[0] for choice in Membership.ROLE_CHOICES]
        if role not in valid_roles:
            return Response({"error": f"Invalid role. Must be one of: {', '.join(valid_roles)}"},
                            status=status.HTTP_400_BAD_REQUEST)

        # Add member to the handler's society
        membership, created = Membership.objects.update_or_create(
            viewer=viewer,
            handler=request.user,
            defaults={'role': role}
        )

        action = "added to" if created else "updated in"
        return Response(
            {"detail": f"Member {viewer.username} {action} society with role {membership.get_role_display()}"},
            status=status.HTTP_200_OK
        )

    def add_member(self, request, pk=None):
        try:
            member = Viewer.objects.get(pk=pk)
            handler = request.user
            role = request.data.get('role', Membership.OTHER)

            # Validate role
            valid_roles = [choice[0] for choice in Membership.ROLE_CHOICES]
            if role not in valid_roles:
                return Response({"error": f"Invalid role. Must be one of: {', '.join(valid_roles)}"},
                                status=status.HTTP_400_BAD_REQUEST)

            # Create or update membership
            membership, created = Membership.objects.update_or_create(
                viewer=member,
                handler=handler,
                defaults={'role': role}
            )

            action = "added to" if created else "updated in"
            return Response(
                {"detail": f"Member {member.username} {action} society with role {membership.get_role_display()}"},
                status=status.HTTP_200_OK
            )
        except Viewer.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['delete'])
    def remove_member(self, request, pk=None):
        try:
            member = Viewer.objects.get(pk=pk)
            handler = request.user

            try:
                membership = Membership.objects.get(viewer=member, handler=handler)
                membership.delete()
                return Response(
                    {"detail": f"Member {member.username} removed from society"},
                    status=status.HTTP_200_OK
                )
            except Membership.DoesNotExist:
                return Response(
                    {"error": "This user is not a member of your society"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except Viewer.DoesNotExist:
            return Response(
                {"error": "User not found"},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['patch'])
    def update_role(self, request, pk=None):
        try:
            member = Viewer.objects.get(pk=pk)
            handler = request.user
            role = request.data.get('role')

            if not role:
                return Response({"error": "Role is required"}, status=status.HTTP_400_BAD_REQUEST)

            # Validate role
            valid_roles = [choice[0] for choice in Membership.ROLE_CHOICES]
            if role not in valid_roles:
                return Response({"error": f"Invalid role. Must be one of: {', '.join(valid_roles)}"},
                                status=status.HTTP_400_BAD_REQUEST)

            try:
                membership = Membership.objects.get(viewer=member, handler=handler)
                membership.role = role
                membership.save()
                return Response(
                    {"detail": f"Role updated to {membership.get_role_display()} for {member.username}"},
                    status=status.HTTP_200_OK
                )
            except Membership.DoesNotExist:
                return Response(
                    {"error": "This user is not a member of your society"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except Viewer.DoesNotExist:
            return Response(
                {"error": "User not found"},
                status=status.HTTP_404_NOT_FOUND
            )


class UserLogoutView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if not refresh_token:
                return Response({"error": "Refresh token is required"}, status=status.HTTP_400_BAD_REQUEST)

            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class RegenerateJoinCodeView(APIView):
    permission_classes = (permissions.IsAuthenticated, IsHandler)

    def post(self, request):
        new_code = request.user.generate_code()
        serializer = JoinCodeSerializer({"join_code": new_code})
        return Response(serializer.data, status=status.HTTP_200_OK)


class UserDeleteView(generics.DestroyAPIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        return self.request.user

    def destroy(self, request, *args, **kwargs):
        user = self.get_object()
        self.perform_destroy(user)
        return Response({"detail": "User deleted successfully."}, status=status.HTTP_204_NO_CONTENT)


class UserListView(generics.ListAPIView):
    queryset = CustomUser.objects.all()
    permission_classes = (permissions.IsAdminUser,)

    def get_serializer_class(self):
        return HandlerSerializer if isinstance(self.request.user, Handler) else ViewerSerializer


# Update in users/views.py

class UserDetailView(generics.RetrieveUpdateAPIView):  # Changed to include UpdateAPIView
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        pk = self.kwargs.get('pk') or self.kwargs.get('user_id') or None
        if pk is None or str(pk).lower() == 'me':
            # Fetch the user with comments count
            return CustomUser.objects.filter(id=self.request.user.id) \
                .annotate(total_comments=Count('comments')).first()
        # Only allow users to edit their own profile
        if pk != self.request.user.pk:
            raise permissions.exceptions.PermissionDenied("You can only edit your own profile")
        return CustomUser.objects.filter(pk=pk) \
            .annotate(total_comments=Count('comments')).first()

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return HandlerProfileUpdateSerializer if isinstance(self.request.user, Handler) else ViewerProfileUpdateSerializer
        return HandlerSerializer if isinstance(self.get_object(), Handler) else ViewerSerializer

    def get_serializer(self, *args, **kwargs):
        fields = self.request.query_params.get('fields')
        if fields and self.request.method == 'GET':
            kwargs['fields'] = fields.split(',')
        return super().get_serializer(*args, **kwargs)

class UserSocietiesView(generics.ListAPIView):
    """List all societies (handlers) that the current user is a member of"""
    permission_classes = (permissions.IsAuthenticated, IsViewer)
    serializer_class = HandlerWithRoleSerializer

    def get_queryset(self):
        viewer = self.request.user
        
        # Get handlers with member counts and role information for the current user
        return Handler.objects.filter(
            viewer_memberships__viewer=viewer
        ).annotate(
            member_count=Count('viewer_memberships'),
            role=F('viewer_memberships__role'),
            role_display=models.Case(
                *[models.When(viewer_memberships__role=choice[0], then=models.Value(choice[1]))
                  for choice in Membership.ROLE_CHOICES],
                default=models.Value('Unknown'),
                output_field=models.CharField(),
            )
        )


class AdminDashboardView(generics.GenericAPIView):
    """
    Admin dashboard view that displays pending handler applications
    and provides functionality to approve/deny them
    """
    permission_classes = (permissions.IsAdminUser,)
    
    def get(self, request, *args, **kwargs):
        applications = HandlerApplication.objects.filter(status=HandlerApplication.STATUS_PENDING)
        serializer = HandlerApplicationSerializer(applications, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'])
    def approve_application(self, request, pk=None):
        """Approve a handler application"""
        try:
            application = HandlerApplication.objects.get(pk=pk, status=HandlerApplication.STATUS_PENDING)
            
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
            
            return Response({"detail": f"Application for {application.society_name} approved."}, status=status.HTTP_200_OK)
            
        except HandlerApplication.DoesNotExist:
            return Response({"error": "Application not found or already processed."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": f"Error approving application: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def deny_application(self, request, pk=None):
        """Deny a handler application"""
        try:
            application = HandlerApplication.objects.get(pk=pk, status=HandlerApplication.STATUS_PENDING)
            
            # Update application status
            application.status = HandlerApplication.STATUS_DENIED
            application.save()
            
            # Send denial email
            send_application_email(application, is_approved=False)
            
            return Response({"detail": f"Application for {application.society_name} denied."}, status=status.HTTP_200_OK)
            
        except HandlerApplication.DoesNotExist:
            return Response({"error": "Application not found or already processed."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": f"Error denying application: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

