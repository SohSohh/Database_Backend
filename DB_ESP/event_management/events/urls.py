from django.urls import path
from .views import EventListView, EventDetailView, HandlerEventListView

urlpatterns = [
    path('', EventListView.as_view(), name='event_list'),  # GET, POST
    path('<int:pk>/', EventDetailView.as_view(), name='event_detail'),  # GET, PUT, PATCH, DELETE
    path('my-events/', HandlerEventListView.as_view(), name='handler_events'),  # GET events created by current user
]