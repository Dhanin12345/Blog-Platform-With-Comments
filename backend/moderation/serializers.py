from rest_framework import serializers
from .models import Report, AuditLog
from users.serializers import AuthorSummarySerializer


class ReportSerializer(serializers.ModelSerializer):
    reporter = AuthorSummarySerializer(read_only=True)
    reviewed_by = AuthorSummarySerializer(read_only=True)
    target_summary = serializers.SerializerMethodField()

    class Meta:
        model = Report
        fields = [
            'id', 'reporter', 'target_type', 'post', 'comment',
            'reported_user', 'reason', 'details', 'status',
            'action_taken', 'reviewed_by', 'created_at', 'updated_at',
            'target_summary'
        ]
        read_only_fields = ['id', 'reporter', 'created_at', 'updated_at']

    def get_target_summary(self, obj):
        if obj.target_type == 'POST' and obj.post:
            return {'title': obj.post.title, 'slug': obj.post.slug, 'author': obj.post.author.username}
        if obj.target_type == 'COMMENT' and obj.comment:
            return {'content': obj.comment.content[:100], 'author': obj.comment.author.username, 'post_slug': obj.comment.post.slug}
        if obj.target_type == 'USER' and obj.reported_user:
            return {'username': obj.reported_user.username, 'role': obj.reported_user.role}
        return {}


class ReportCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = ['target_type', 'post', 'comment', 'reported_user', 'reason', 'details']


class AuditLogSerializer(serializers.ModelSerializer):
    user = AuthorSummarySerializer(read_only=True)

    class Meta:
        model = AuditLog
        fields = ['id', 'user', 'action', 'resource_type', 'resource_id', 'details', 'ip_address', 'timestamp']
