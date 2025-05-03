from rest_framework import generics, filters, permissions, status
from django_filters.rest_framework import DjangoFilterBackend
from .models import Event, Category, Comment
from .serializers import EventSerializer, EventDetailSerializer, EventUpdateSerializer, AttendeeSerializer, CategorySerializer, CommentSerializer
from .permissions import IsHandlerOrReadOnly, IsEventHost

from rest_framework.response import Response



class EventListView(generics.ListCreateAPIView):
    """
    List all events or create a new event.
    - GET: Any authenticated user can view all events
    - POST: Only handlers can create events
    """
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [IsHandlerOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['date', 'location', 'host', 'category']  # Added category
    search_fields = ['name', 'description', 'location']
    ordering_fields = ['date', 'start_time', 'name']

    def get_queryset(self):
        """Get all events"""
        return Event.objects.all()


class EventDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete an event.
    - GET: Any authenticated user can view details
    - PUT/PATCH/DELETE: Only the host of the event can modify/delete it
    """
    queryset = Event.objects.all()
    serializer_class = EventDetailSerializer
    permission_classes = [permissions.IsAuthenticated, IsEventHost]

    def get_serializer(self, *args, **kwargs):
        """Get serializer with dynamic field filtering for GET requests"""
        if self.request.method == 'GET':
            fields = self.request.query_params.get('fields')
            if fields:
                kwargs['fields'] = fields.split(',')
            return super().get_serializer(*args, **kwargs)
        elif self.request.method in ['PUT', 'PATCH']:
            # Use the update serializer for PUT/PATCH
            kwargs['partial'] = True
            return EventUpdateSerializer(*args, **kwargs)
        return super().get_serializer(*args, **kwargs)


class HandlerEventListView(generics.ListAPIView):
    """
    List events created by a specific handler or the current user
    - If user_id parameter is provided, show events by that user
    - If no parameter, show current user's events
    """
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['date', 'location', 'category']
    search_fields = ['name', 'description', 'location']
    ordering_fields = ['date', 'start_time', 'name']

    def get_queryset(self):
        """Get events created by a specific user or current user"""
        user_id = self.request.query_params.get('user_id')
        if user_id:
            # If user_id provided as query parameter, show that user's events
            return Event.objects.filter(host_id=user_id)
        # Otherwise, show current user's events
        return Event.objects.filter(host=self.request.user)

class EventAttendanceView(generics.GenericAPIView):
    """
    Manage event attendance.
    - POST: Attend or unattend an event
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = AttendeeSerializer
    queryset = Event.objects.all()

    def post(self, request, *args, **kwargs):
        """Handle attendance actions"""
        event = self.get_object()
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            action = serializer.validated_data['action']
            user = request.user

            if action == 'attend':
                # Add user to attendees if not already attending
                if not event.attendees.filter(id=user.id).exists():
                    event.attendees.add(user)
                    return Response(
                        {"detail": "You are now attending this event", "attendee_count": event.attendee_count},
                        status=status.HTTP_200_OK
                    )
                return Response(
                    {"detail": "You are already attending this event", "attendee_count": event.attendee_count},
                    status=status.HTTP_200_OK
                )

            elif action == 'unattend':
                # Remove user from attendees if attending
                if event.attendees.filter(id=user.id).exists():
                    event.attendees.remove(user)
                    return Response(
                        {"detail": "You are no longer attending this event", "attendee_count": event.attendee_count},
                        status=status.HTTP_200_OK
                    )
                return Response(
                    {"detail": "You are not attending this event", "attendee_count": event.attendee_count},
                    status=status.HTTP_200_OK
                )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserAttendingEventsView(generics.ListAPIView):
    """List all events the current user is attending"""
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['date', 'location']
    search_fields = ['name', 'description', 'location']
    ordering_fields = ['date', 'start_time', 'name']

    def get_queryset(self):
        """Get only events the current user is attending"""
        return self.request.user.attending_events.all()


class CategoryListView(generics.ListAPIView):
    """List all categories"""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]


class EventCommentsView(generics.ListCreateAPIView):
    """
    List all comments for a specific event or create a new comment
    """
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Get comments for a specific event"""
        event_id = self.kwargs.get('pk')
        return Comment.objects.filter(event_id=event_id)

    def perform_create(self, serializer):
        """Set event from URL and user from request"""
        event_id = self.kwargs.get('pk')
        serializer.save(user=self.request.user, event_id=event_id)
