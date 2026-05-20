"""
Custom permission classes for role-based access control.
"""
from rest_framework import permissions


class IsAdminRole(permissions.BasePermission):
    """
    Allows access only to users with admin role.
    """
    message = 'Access denied: Admin role required.'
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Allows access to object owners or admin users.
    For create operations, allows any authenticated user.
    """
    message = 'Access denied: You can only modify your own resources.'
    
    def has_permission(self, request, view):
        # Allow authenticated users to create
        if view.action == 'create':
            return request.user.is_authenticated
        return request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        # Admins can access everything
        if request.user.role == 'admin':
            return True
        # Owners can access their own objects
        if hasattr(obj, 'created_by'):
            return obj.created_by == request.user
        return False


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Allows read access to any authenticated user, 
    write access only to admins.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_authenticated
        return request.user.is_authenticated and request.user.role == 'admin'