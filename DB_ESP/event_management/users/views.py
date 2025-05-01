from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from .serializers import (
    UserRegistrationSerializer,
    UserSerializer,
    UserDetailSerializer,
    CustomTokenObtainPairSerializer
)

User = get_user_model()


class CustomTokenObtainPairView(TokenObtainPairView):
    """Custom token view to use email for authentication"""
    serializer_class = CustomTokenObtainPairSerializer


class UserRegistrationView(generics.CreateAPIView):
    """View for user registration"""
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = UserRegistrationSerializer


class UserLogoutView(APIView):
    """View for user logout - blacklists the JWT token"""
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        try:
            # Check if refresh token is in request data
            refresh_token = request.data.get("refresh")
            if not refresh_token:
                return Response({"error": "Refresh token is required"}, status=status.HTTP_400_BAD_REQUEST)

            token = RefreshToken(refresh_token)
            # Replace token.blacklist() with the correct method
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class UserDeleteView(generics.DestroyAPIView):
    """View for user account deletion"""
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        return self.request.user

    def destroy(self, request, *args, **kwargs):
        user = self.get_object()
        self.perform_destroy(user)
        return Response({"detail": "User deleted successfully."}, status=status.HTTP_204_NO_CONTENT)


class UserListView(generics.ListAPIView):
    """View to list all users - admin only"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAdminUser,)


class UserDetailView(generics.RetrieveAPIView):
    """View to get a specific user's details with field filtering"""
    serializer_class = UserDetailSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        # If looking up current user, return current user
        if self.kwargs.get('pk') == 'me':
            return self.request.user
        # Otherwise get user by ID (but only admins can see other users)
        if not self.request.user.is_staff:
            # Regular users can only view themselves
            if str(self.request.user.id) != self.kwargs.get('pk'):
                self.permission_denied(self.request)
        return User.objects.get(pk=self.kwargs.get('pk'))

    def get_serializer(self, *args, **kwargs):
        """Get serializer with dynamic field filtering"""
        fields = self.request.query_params.get('fields')
        if fields:
            kwargs['fields'] = fields.split(',')
        return super().get_serializer(*args, **kwargs)


class CurrentUserView(generics.RetrieveAPIView):
    """View to get current user details with field filtering"""
    serializer_class = UserDetailSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        return self.request.user

    def get_serializer(self, *args, **kwargs):
        """Get serializer with dynamic field filtering"""
        fields = self.request.query_params.get('fields')
        if fields:
            kwargs['fields'] = fields.split(',')
        return super().get_serializer(*args, **kwargs)