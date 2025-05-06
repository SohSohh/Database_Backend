from rest_framework import permissions

class IsHandler(permissions.BasePermission):
    """Custom permission to only allow handlers to access certain views"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.user_type == 'handler'


class IsViewer(permissions.BasePermission):
    """Custom permission to only allow viewers to access certain views"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.user_type == 'viewer'