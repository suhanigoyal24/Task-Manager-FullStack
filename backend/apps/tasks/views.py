"""
Views for task CRUD operations with role-based access.
"""
import logging
from rest_framework import status, generics, filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, OpenApiResponse
from .models import Task
from .serializers import TaskSerializer, TaskListSerializer
from apps.users.permissions import IsOwnerOrAdmin, IsAdminRole

logger = logging.getLogger(__name__)


@extend_schema(tags=['tasks'])
class TaskListView(generics.ListCreateAPIView):
    """
    List tasks (users see own, admin sees all) or create new task.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = TaskSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'status', 'title']
    ordering = ['-created_at']
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Task.objects.all()
        return Task.objects.filter(created_by=user)
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return TaskListSerializer
        return TaskSerializer
    
    @extend_schema(
        parameters=[
            OpenApiResponse(description='List of tasks', response=TaskListSerializer(many=True)),
        ]
    )
    def get(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response({
                'success': True,
                'data': serializer.data
            })
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'success': True,
            'data': serializer.data
        })
    
    @extend_schema(
        request=TaskSerializer,
        responses={
            201: OpenApiResponse(description='Task created successfully', response=TaskSerializer),
            400: OpenApiResponse(description='Validation error')
        }
    )
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        task = serializer.save()
        
        logger.info(f"Task created: {task.id} by {request.user.email}")
        
        return Response({
            'success': True,
            'data': TaskSerializer(task).data
        }, status=status.HTTP_201_CREATED)


@extend_schema(tags=['tasks'])
class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update, or delete a specific task.
    - GET: Owner or admin can view
    - PUT: Owner or admin can update
    - DELETE: Admin only
    """
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Task.objects.all()
        return Task.objects.filter(created_by=user)
    
    def get_serializer_class(self):
        return TaskSerializer
    
    def get_permissions(self):
        """Customize permissions per action."""
        if self.request.method == 'DELETE':
            return [IsAuthenticated(), IsAdminRole()]
        return [IsAuthenticated(), IsOwnerOrAdmin()]
    
    @extend_schema(
        responses={
            200: OpenApiResponse(description='Task retrieved successfully', response=TaskSerializer),
            404: OpenApiResponse(description='Task not found')
        }
    )
    def get(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({
            'success': True,
            'data': serializer.data
        })
    
    @extend_schema(
        request=TaskSerializer,
        responses={
            200: OpenApiResponse(description='Task updated successfully', response=TaskSerializer),
            400: OpenApiResponse(description='Validation error'),
            403: OpenApiResponse(description='Permission denied')
        }
    )
    def put(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        task = serializer.save()
        
        logger.info(f"Task updated: {task.id} by {request.user.email}")
        
        return Response({
            'success': True,
            'data': TaskSerializer(task).data
        })
    
    @extend_schema(
        responses={
            204: OpenApiResponse(description='Task deleted successfully'),
            403: OpenApiResponse(description='Permission denied: Admin only'),
            404: OpenApiResponse(description='Task not found')
        }
    )
    def delete(self, request, *args, **kwargs):
        instance = self.get_object()
        task_id = instance.id
        instance.delete()
        
        logger.info(f"Task deleted: {task_id} by {request.user.email}")
        
        return Response({
            'success': True,
            'data': {'message': 'Task deleted successfully'}
        }, status=status.HTTP_204_NO_CONTENT)