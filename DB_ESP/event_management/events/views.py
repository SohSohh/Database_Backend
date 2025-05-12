from django.shortcuts import get_object_or_404
from rest_framework import generics, filters, permissions, status
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError

from .models import Event, Category, Comment, Announcement
from .serializers import (
    EventSerializer,
    EventDetailSerializer,
    EventUpdateSerializer,
    AttendeeSerializer,
    CategorySerializer,
    CommentSerializer,
    AnnouncementSerializer
)
from .permissions import IsHandlerOrReadOnly, IsEventHost


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
    filterset_fields = ['date', 'location', 'host', 'category']
    search_fields = ['name', 'description', 'location']
    ordering_fields = ['date', 'start_time', 'name']

    def perform_create(self, serializer):
        """Set host as the current user"""
        serializer.save(host=self.request.user)


class EventDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete an event.
    - GET: Any authenticated user can view details
    - PUT/PATCH/DELETE: Only the host of the event can modify/delete it
    """
    queryset = Event.objects.all()
    permission_classes = [permissions.IsAuthenticated, IsEventHost]

    def get_serializer_class(self):
        """Select appropriate serializer based on the request method"""
        if self.request.method in ['PUT', 'PATCH']:
            return EventUpdateSerializer
        return EventDetailSerializer

    def get_serializer(self, *args, **kwargs):
        """Get serializer with dynamic field filtering for GET requests"""
        if self.request.method == 'GET':
            fields = self.request.query_params.get('fields')
            if fields:
                kwargs['fields'] = fields.split(',')
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

            # Enforce that only viewers can attend events
            if user.user_type != 'viewer':
                return Response(
                    {"error": "Only viewers can attend events"},
                    status=status.HTTP_403_FORBIDDEN
                )

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


class EventRatingView(generics.RetrieveAPIView):
    """Get the average rating for a specific event"""
    queryset = Event.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def retrieve(self, request, *args, **kwargs):
        event = self.get_object()
        return Response({
            'event_id': event.id,
            'event_name': event.name,
            'average_rating': event.average_rating,
            'rating_count': event.comments.count()
        }, status=status.HTTP_200_OK)


class EventCommentsView(generics.ListCreateAPIView):
    """
    List all comments for a specific event or create a new comment.
    Comments can only be created after the event has ended.
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
        event = get_object_or_404(Event, pk=event_id)

        # Check if event has ended
        if not event.has_ended():
            raise ValidationError({'error': 'Comments can only be added after the event has ended.'})

        # Removed validation for "announcement" category
        serializer.save(user=self.request.user, event_id=event_id)


class AnnouncementListView(generics.ListCreateAPIView):
    """
    List all announcements or create a new announcement.
    - GET: Any authenticated user can view announcements
    - POST: Only handlers can create announcements
    """
    queryset = Announcement.objects.all()
    serializer_class = AnnouncementSerializer
    permission_classes = [IsHandlerOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description']
    ordering_fields = ['date_made', 'title']

    def perform_create(self, serializer):
        serializer.save(host=self.request.user)


class AnnouncementDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete an announcement.
    - GET: Any authenticated user can view details
    - PUT/PATCH/DELETE: Only the host can modify/delete it
    """
    queryset = Announcement.objects.all()
    serializer_class = AnnouncementSerializer
    permission_classes = [permissions.IsAuthenticated, IsEventHost]


class HandlerAnnouncementsView(generics.ListAPIView):
    """List announcements created by a specific handler"""
    serializer_class = AnnouncementSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description']
    ordering_fields = ['date_made', 'title']

    def get_queryset(self):
        return Announcement.objects.filter(host=self.request.user)

