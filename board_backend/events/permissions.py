from rest_framework import permissions


class IsHandler(permissions.BasePermission):
    """
    Permission to only allow handlers to create events.
    """

    def has_permission(self, request, view):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD, or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to handlers
        return request.user.is_authenticated and request.user.is_handler()


class IsCreatorOrReadOnly(permissions.BasePermission):
    """
    Permission to only allow creators of an event to edit it.
    """

    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to the creator of the event
        return obj.created_by == request.user