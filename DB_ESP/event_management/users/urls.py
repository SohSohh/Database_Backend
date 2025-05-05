from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    CustomTokenObtainPairView,
    UserLogoutView,
    UserDeleteView,
    UserListView,
    UserDetailView,
    ViewerRegistrationView,
    HandlerRegistrationView,
    SocietyListView,
    MembershipView,
    SocietyMembersViewSet,
    RegenerateJoinCodeView,
    UserSocietiesView
)

urlpatterns = [
    # Authentication endpoints with separate registration routes
    path('register/viewer/', ViewerRegistrationView.as_view(), name='register_viewer'),
    path('register/handler/', HandlerRegistrationView.as_view(), name='register_handler'),
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', UserLogoutView.as_view(), name='logout'),
    path('delete/', UserDeleteView.as_view(), name='delete_account'),

    # User information endpoints
    path('', UserListView.as_view(), name='user_list'),  # Admin only
    path('me/', UserDetailView.as_view(), name='my_detail'),
    path('<int:pk>/', UserDetailView.as_view(), name='user_detail'),

    # Society and membership endpoints
    path('societies/', SocietyListView.as_view(), name='society_list'),
    path('my-societies/', UserSocietiesView.as_view(), name='my_societies'),
    path('membership/', MembershipView.as_view(), name='join_society'),

    path('society/members/', SocietyMembersViewSet.as_view({
        'get': 'list',
    }), name='society_members'),

    path('society/members/<int:pk>/', SocietyMembersViewSet.as_view({
        'get': 'retrieve',
        'patch': 'update_role',
        'delete': 'remove_member',
        'post': 'add_member',
    }), name='society_member_detail'),

    path('society/join-code/', RegenerateJoinCodeView.as_view(), name='regenerate_join_code'),
    path('society/members/add/', SocietyMembersViewSet.as_view({'post': 'add_member'}), name='add_member'),
]
