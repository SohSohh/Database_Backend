from django.urls import path
from .views import (
    EventListView,
    EventDetailView,
    HandlerEventListView,
    EventAttendanceView,
    UserAttendingEventsView,
    CategoryListView,
    EventCommentsView
)

urlpatterns = [
    path('', EventListView.as_view(), name='event_list'),  # GET, POST
    path('<int:pk>/', EventDetailView.as_view(), name='event_detail'),  # GET, PUT, PATCH, DELETE
    path('handler/events/', HandlerEventListView.as_view(), name='handler_events'),  # GET events with optional user_id
    path('<int:pk>/attendance/', EventAttendanceView.as_view(), name='event_attendance'),  # POST to attend/unattend
    path('attending/', UserAttendingEventsView.as_view(), name='attending_events'),  # GET events user is attending
    path('categories/', CategoryListView.as_view(), name='category_list'),
    path('<int:pk>/comments/', EventCommentsView.as_view(), name='event_comments'),
]