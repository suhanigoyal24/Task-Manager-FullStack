"""
URL patterns for task endpoints.
"""
from django.urls import path
from .views import TaskListView, TaskDetailView

app_name = 'tasks'

urlpatterns = [
    path('', TaskListView.as_view(), name='task-list'),
    path('<uuid:id>/', TaskDetailView.as_view(), name='task-detail'),
]