from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.db.models import Count
from rest_framework.decorators import action
from django.db.models import Subquery, OuterRef, Count

from .models import CustomUser, Handler, Viewer
from .serializers import (
    HandlerSerializer,
    ViewerSerializer,
    CustomTokenObtainPairSerializer,
    ViewerRegistrationSerializer,
    HandlerRegistrationSerializer,
    SocietyMembershipSerializer,
    JoinCodeSerializer
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
            handler.memberships.add(request.user)
            return Response(
                {"detail": f"You have joined {handler.society_name}"},
                status=status.HTTP_200_OK
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SocietyMembersViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ViewerSerializer
    permission_classes = (permissions.IsAuthenticated, IsHandler)

    def get_queryset(self):
        return self.request.user.memberships

    @action(detail=True, methods=['delete'])
    def remove_member(self, request, pk=None):
        try:
            member = Viewer.objects.get(pk=pk)
            if member in request.user.memberships.all():
                request.user.memberships.remove(member)
                return Response(
                    {"detail": f"Member {member.username} removed from society"},
                    status=status.HTTP_200_OK
                )
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