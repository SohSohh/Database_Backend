from rest_framework import permissions


class IsHandlerOrReadOnly(permissions.BasePermission):
    """
    Custom permission:
    - Allow read-only access for any authenticated user
    - Allow write access only for handlers
    """

    def has_permission(self, request, view):
        # Allow read-only access for any authenticated user
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_authenticated

        # Allow write access only for handlers
        return request.user.is_authenticated and request.user.is_handler()


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