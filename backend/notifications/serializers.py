from rest_framework import serializers
from .models import Notification
from users.serializers import AuthorSummarySerializer


class NotificationSerializer(serializers.ModelSerializer):
    sender = AuthorSummarySerializer(read_only=True)

    class Meta:
        model = Notification
        fields = [
            'id', 'sender', 'notification_type', 'title',
            'message', 'target_url', 'is_read', 'created_at'
        ]
