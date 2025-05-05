from django.urls import path
from .views import (
    EventListView,
    EventDetailView,
    HandlerEventListView,
    EventAttendanceView,
    UserAttendingEventsView,
    CategoryListView,
    EventCommentsView,
    EventRatingView,
    AnnouncementListView,
    AnnouncementDetailView,
    HandlerAnnouncementsView,
)

# Consistent URL pattern organization - similar to user URLs
urlpatterns = [
    # Basic event CRUD endpoints
    path('', EventListView.as_view(), name='event_list'),  # GET, POST
    path('<int:pk>/', EventDetailView.as_view(), name='event_detail'),  # GET, PUT, PATCH, DELETE

    # Event relation endpoints
    path('<int:pk>/attendance/', EventAttendanceView.as_view(), name='event_attendance'),  # POST to attend/unattend
    path('<int:pk>/comments/', EventCommentsView.as_view(), name='event_comments'),  # Event comments
    path('<int:pk>/rating/', EventRatingView.as_view(), name='event_rating'),  # GET average event rating

    # User-specific event endpoints
    path('handler/', HandlerEventListView.as_view(), name='handler_events'),  # GET events created by handler
    path('attending/', UserAttendingEventsView.as_view(), name='attending_events'),  # GET events user is attending

    # Supporting endpoints
    path('categories/', CategoryListView.as_view(), name='category_list'),  # Event categories

    # Announcement endpoints
    path('announcements/', AnnouncementListView.as_view(), name='announcement_list'),
    path('announcements/<int:pk>/', AnnouncementDetailView.as_view(), name='announcement_detail'),
    path('announcements/handler/', HandlerAnnouncementsView.as_view(), name='handler_announcements'),
]
