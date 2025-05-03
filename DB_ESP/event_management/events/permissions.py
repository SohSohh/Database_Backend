from rest_framework import permissions


class IsHandlerOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        # Allow read-only access for any authenticated user
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_authenticated

        # Update this line to use user_type attribute instead of is_handler() method
        return request.user.is_authenticated and request.user.user_type == 'handler'


class IsEventHost(permissions.BasePermission):
    """
    Custom permission to allow only event hosts to edit or delete their own events
    """

    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any authenticated user
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to the host of the event
        return obj.host == request.user