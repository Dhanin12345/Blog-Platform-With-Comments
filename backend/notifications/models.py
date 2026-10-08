from django.conf import settings
from django.db import models


class NotificationType(models.TextChoices):
    COMMENT = 'COMMENT', 'New Comment'
    REPLY = 'REPLY', 'Comment Reply'
    LIKE = 'LIKE', 'Post Like'
    FOLLOW = 'FOLLOW', 'New Follower'
    PUBLISH = 'PUBLISH', 'Post Published'
    MENTION = 'MENTION', 'User Mention'
    ANNOUNCEMENT = 'ANNOUNCEMENT', 'Announcement'


class Notification(models.Model):
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications',
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='sent_notifications',
    )
    notification_type = models.CharField(
        max_length=20,
        choices=NotificationType.choices,
        default=NotificationType.ANNOUNCEMENT,
    )
    title = models.CharField(max_length=255)
    message = models.TextField()
    target_url = models.CharField(max_length=500, blank=True, default='')
    is_read = models.BooleanField(default=False, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Notification for {self.recipient.username}: {self.title} ({self.notification_type})"
