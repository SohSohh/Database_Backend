from rest_framework import generics, filters, permissions
from django_filters.rest_framework import DjangoFilterBackend
from .models import Event, Feedback
from .serializers import EventSerializer, EventDetailSerializer, EventUpdateSerializer, FeedbackSerializer
from .permissions import IsHandlerOrReadOnly, IsEventHost
from django.shortcuts import get_object_or_404


class EventListView(generics.ListCreateAPIView):
    """
    List all events or create a new event.
    - GET: Any authenticated user can view all events
    - POST: Only handlers can create events
    """
    serializer_class = EventSerializer
    permission_classes = [IsHandlerOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['date', 'location', 'host']  # Filter by any field
    search_fields = ['name', 'description', 'location']  # Search in these fields
    ordering_fields = ['date', 'start_time', 'name']  # Order by these fields

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
    """List all events created by the current handler"""
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Get only events created by the current user"""
        user = self.request.user
        return Event.objects.filter(host=user)


# events/views.py (rewritten with more generics)
from rest_framework import generics, filters, permissions, status
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Event
from .serializers import EventSerializer, EventDetailSerializer, EventUpdateSerializer, AttendeeSerializer
from .permissions import IsHandlerOrReadOnly, IsEventHost


# Keep existing views (EventListView, EventDetailView, HandlerEventListView)

# Rewritten with generics for attendance management
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


class FeedbackCreateView(generics.CreateAPIView):
    """View for creating feedback"""
    queryset = Feedback.objects.all()
    serializer_class = FeedbackSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        event_id = self.kwargs.get('event_id')
        event = get_object_or_404(Event, id=event_id)
        serializer.save(user=self.request.user, event=event)


class EventFeedbackListView(generics.ListAPIView):
    """View for listing all feedback for an event"""
    serializer_class = FeedbackSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        event_id = self.kwargs.get('event_id')
        return Feedback.objects.filter(event_id=event_id)

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        
        # Calculate average rating
        if queryset.exists():
            avg_rating = sum(fb.rating for fb in queryset) / queryset.count()
        else:
            avg_rating = 0
        
        response_data = {
            'average_rating': round(avg_rating, 1),
            'total_feedback': queryset.count(),
            'feedback': serializer.data
        }
        
        return Response(response_data)


class UserFeedbackListView(generics.ListAPIView):
    """View for listing all feedback by a user"""
    serializer_class = FeedbackSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Feedback.objects.filter(user=self.request.user)