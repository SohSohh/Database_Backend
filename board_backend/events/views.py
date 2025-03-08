from rest_framework import viewsets, permissions, status, generics
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.decorators import action
from django.contrib.auth import logout
from .models import User, Event
from .serializers import UserSerializer, RegisterSerializer, EventSerializer
from .permissions import IsHandler, IsCreatorOrReadOnly


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class CustomAuthToken(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user_id': user.pk,
            'username': user.username,
            'role': user.role
        })


class LogoutView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        # Delete the token to logout
        request.user.auth_token.delete()
        logout(request)
        return Response({"message": "Successfully logged out."}, status=status.HTTP_200_OK)


class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action in ['create']:
            permission_classes = [permissions.IsAuthenticated, IsHandler]
        elif self.action in ['update', 'partial_update', 'destroy']:
            permission_classes = [permissions.IsAuthenticated, IsCreatorOrReadOnly]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        """
        This view should return all events for staff/admin,
        and only their created events for handlers when not using GET.
        """
        user = self.request.user

        # For unsafe methods, handlers can only see their own events
        if self.request.method not in permissions.SAFE_METHODS and user.is_handler():
            return Event.objects.filter(created_by=user)

        # For safe methods or admin/staff, return all events
        return Event.objects.all()
