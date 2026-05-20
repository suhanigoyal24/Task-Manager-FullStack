"""
Serializers for task management.
"""
from rest_framework import serializers
from .models import Task
from apps.users.serializers import UserSerializer


class TaskSerializer(serializers.ModelSerializer):
    """Serializer for task CRUD operations."""
    created_by_details = UserSerializer(source='created_by', read_only=True)
    
    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'status', 
            'created_by', 'created_by_details',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']
    
    def validate_title(self, value):
        """Ensure title is not empty after stripping."""
        if not value.strip():
            raise serializers.ValidationError("Title cannot be empty.")
        return value.strip()
    
    def validate_status(self, value):
        """Ensure status is valid choice."""
        valid_statuses = [choice[0] for choice in Task.STATUS_CHOICES]
        if value not in valid_statuses:
            raise serializers.ValidationError(f"Status must be one of: {valid_statuses}")
        return value
    
    def create(self, validated_data):
        """Set created_by to current user."""
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['created_by'] = request.user
        return super().create(validated_data)


class TaskListSerializer(serializers.ModelSerializer):
    """Simplified serializer for task listing."""
    owner_email = serializers.EmailField(source='created_by.email', read_only=True)
    owner_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = Task
        fields = ['id', 'title', 'status', 'owner_email', 'owner_name', 'created_at']
        read_only_fields = fields