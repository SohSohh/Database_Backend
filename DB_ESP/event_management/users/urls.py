from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    UserRegistrationView,
    CustomTokenObtainPairView,
    UserLogoutView,
    UserDeleteView,
    UserListView,
    UserDetailView,
    CurrentUserView
)

urlpatterns = [
    # Authentication endpoints
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', UserLogoutView.as_view(), name='logout'),
    path('delete/', UserDeleteView.as_view(), name='delete_account'),

    # User information endpoints
    path('', UserListView.as_view(), name='user_list'),  # Admin only
    path('me/', CurrentUserView.as_view(), name='current_user'),
    path('<int:pk>/', UserDetailView.as_view(), name='user_detail'),
    path('me/<str:fields>/', CurrentUserView.as_view(), name='current_user_fields'),  # Alternate way to specify fields
]