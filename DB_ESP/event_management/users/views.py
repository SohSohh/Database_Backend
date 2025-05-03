from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.db.models import Count
from rest_framework.decorators import action
from django.db.models import Subquery, OuterRef, Count
from django.db import models
from .models import CustomUser, Handler, Viewer, Membership
from .serializers import (
    HandlerSerializer,
    ViewerSerializer,
    CustomTokenObtainPairSerializer,
    ViewerRegistrationSerializer,
    HandlerRegistrationSerializer,
    SocietyMembershipSerializer,
    JoinCodeSerializer, MemberWithRoleSerializer
)
from .permissions import IsHandler, IsViewer


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class ViewerRegistrationView(generics.CreateAPIView):
    queryset = Viewer.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = ViewerRegistrationSerializer


class HandlerRegistrationView(generics.CreateAPIView):
    queryset = Handler.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = HandlerRegistrationSerializer


class SocietyListView(generics.ListAPIView):
    serializer_class = HandlerSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        # Use a subquery to correctly count how many viewers have this handler in their memberships
        subquery = CustomUser.objects.filter(
            memberships=OuterRef('pk'),
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


class UserDetailView(generics.RetrieveAPIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        pk = self.kwargs.get('pk') or self.kwargs.get('user_id') or None
        if pk is None or str(pk).lower() == 'me':
            return self.request.user
        return CustomUser.objects.get(pk=pk)

    def get_serializer_class(self):
        user = self.get_object()
        return HandlerSerializer if isinstance(user,
                                               Handler) or user.user_type == CustomUser.HANDLER else ViewerSerializer

    def get_serializer(self, *args, **kwargs):
        fields = self.request.query_params.get('fields')
        if fields:
            kwargs['fields'] = fields.split(',')
        return super().get_serializer(*args, **kwargs)