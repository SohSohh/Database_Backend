from rest_framework import generics, filters, permissions
from django_filters.rest_framework import DjangoFilterBackend
from .models import Event
from .serializers import EventSerializer, EventDetailSerializer, EventUpdateSerializer
from .permissions import IsHandlerOrReadOnly, IsEventHost


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