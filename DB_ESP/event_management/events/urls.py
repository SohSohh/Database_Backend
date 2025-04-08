# events/urls.py
from django.urls import path
from .views import (
    EventListView,
    EventDetailView,
    HandlerEventListView,
    EventAttendanceView,
    UserAttendingEventsView
)

urlpatterns = [
    path('', EventListView.as_view(), name='event_list'),  # GET, POST
    path('<int:pk>/', EventDetailView.as_view(), name='event_detail'),  # GET, PUT, PATCH, DELETE
    path('my-events/', HandlerEventListView.as_view(), name='handler_events'),  # GET events created by current user
    path('<int:pk>/attendance/', EventAttendanceView.as_view(), name='event_attendance'),  # POST to attend/unattend
    path('attending/', UserAttendingEventsView.as_view(), name='attending_events'),  # GET events user is attending
]