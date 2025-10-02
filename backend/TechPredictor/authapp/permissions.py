from rest_framework import permissions

class IsDispatcher(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and getattr(request.user, "role", None) == request.user.ROLE_DISPATCHER)

class IsOperator(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and getattr(request.user, "role", None) == request.user.ROLE_OPERATOR)
