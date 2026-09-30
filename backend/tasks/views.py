from rest_framework import viewsets, permissions
from .models import Task
from .serializers import TaskSerializer


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Task.objects.filter(user=self.request.user).order_by("-created_at", "-id")

        params = self.request.query_params
        search = params.get("search", "").strip()
        status = params.get("status")
        priority = params.get("priority")

        if search:
            qs = qs.filter(title__icontains=search)
        if status in dict(Task.STATUS_CHOICES):
            qs = qs.filter(status=status)
        if priority in dict(Task.PRIORITY_CHOICES):
            qs = qs.filter(priority=priority)

        return qs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)