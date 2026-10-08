from rest_framework import generics, viewsets, permissions, status, views
from rest_framework.response import Response
from rest_framework.decorators import action
from django.utils import timezone

from .models import Report, AuditLog, ReportStatus
from .serializers import ReportSerializer, ReportCreateSerializer, AuditLogSerializer
from comments.models import Comment, CommentStatus
from posts.models import Post, PostStatus
from users.models import User, UserRole


class IsModeratorOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            (request.user.role in [UserRole.ADMIN, UserRole.MODERATOR] or request.user.is_superuser)
        )


class ReportCreateView(generics.CreateAPIView):
    queryset = Report.objects.all()
    serializer_class = ReportCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        report = serializer.save(reporter=self.request.user)
        # Log to audit log
        AuditLog.objects.create(
            user=self.request.user,
            action=f"Filed Report on {report.target_type}",
            resource_type=report.target_type,
            resource_id=str(report.post_id or report.comment_id or report.reported_user_id or ''),
            details=f"Reason: {report.reason}. Details: {report.details[:100]}",
        )


class ReportManageViewSet(viewsets.ModelViewSet):
    queryset = Report.objects.all().order_by('-created_at')
    permission_classes = [IsModeratorOrAdmin]

    def get_serializer_class(self):
        if self.action == 'create':
            return ReportCreateSerializer
        return ReportSerializer

    @action(detail=True, methods=['post'])
    def resolve(self, request, pk=None):
        report = self.get_object()
        action_type = request.data.get('action_type', 'WARNING')  # REMOVE_CONTENT, WARN_USER, SUSPEND_USER, DISMISS
        notes = request.data.get('notes', '')

        if action_type == 'REMOVE_CONTENT':
            if report.target_type == 'COMMENT' and report.comment:
                report.comment.status = CommentStatus.REMOVED
                report.comment.save()
            elif report.target_type == 'POST' and report.post:
                report.post.status = PostStatus.DELETED
                report.post.save()
            report.action_taken = f"Content removed. {notes}".strip()
            report.status = ReportStatus.RESOLVED

        elif action_type == 'SUSPEND_USER':
            target_user = report.reported_user or (report.comment.author if report.comment else (report.post.author if report.post else None))
            if target_user:
                target_user.is_active = False
                target_user.save()
            report.action_taken = f"User suspended. {notes}".strip()
            report.status = ReportStatus.RESOLVED

        elif action_type == 'DISMISS':
            report.status = ReportStatus.DISMISSED
            report.action_taken = f"Dismissed as non-violating. {notes}".strip()

        else:
            report.status = ReportStatus.RESOLVED
            report.action_taken = f"Warning issued. {notes}".strip()

        report.reviewed_by = request.user
        report.save()

        # Audit log
        AuditLog.objects.create(
            user=request.user,
            action=f"Moderation: {report.action_taken}",
            resource_type=report.target_type,
            resource_id=str(report.id),
            details=f"Report #{report.id} resolved by {request.user.username}",
        )

        return Response(ReportSerializer(report).data)


class AuditLogListView(generics.ListAPIView):
    queryset = AuditLog.objects.all().order_by('-timestamp')[:100]
    serializer_class = AuditLogSerializer
    permission_classes = [IsModeratorOrAdmin]
