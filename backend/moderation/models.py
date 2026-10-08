from django.conf import settings
from django.db import models


class TargetType(models.TextChoices):
    POST = 'POST', 'Post'
    COMMENT = 'COMMENT', 'Comment'
    USER = 'USER', 'User'


class ReportReason(models.TextChoices):
    SPAM = 'SPAM', 'Spam or Advertising'
    HARASSMENT = 'HARASSMENT', 'Harassment or Bullying'
    HATE_SPEECH = 'HATE_SPEECH', 'Hate Speech'
    MISLEADING = 'MISLEADING', 'Misleading Information'
    COPYRIGHT = 'COPYRIGHT', 'Copyright Infringement'
    OTHER = 'OTHER', 'Other Violation'


class ReportStatus(models.TextChoices):
    PENDING = 'PENDING', 'Pending Review'
    REVIEWED = 'REVIEWED', 'Under Review'
    RESOLVED = 'RESOLVED', 'Action Taken (Resolved)'
    DISMISSED = 'DISMISSED', 'Dismissed'


class Report(models.Model):
    reporter = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='filed_reports',
    )
    target_type = models.CharField(
        max_length=20,
        choices=TargetType.choices,
        default=TargetType.POST,
    )
    post = models.ForeignKey(
        'posts.Post',
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name='reports',
    )
    comment = models.ForeignKey(
        'comments.Comment',
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name='reports',
    )
    reported_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name='reports_received',
    )
    reason = models.CharField(
        max_length=30,
        choices=ReportReason.choices,
        default=ReportReason.SPAM,
    )
    details = models.TextField(blank=True, default='')
    status = models.CharField(
        max_length=20,
        choices=ReportStatus.choices,
        default=ReportStatus.PENDING,
        db_index=True,
    )
    action_taken = models.CharField(max_length=255, blank=True, default='')
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='reviewed_reports',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Report #{self.pk}: {self.target_type} ({self.reason}) - {self.status}"


class AuditLog(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='audit_logs',
    )
    action = models.CharField(max_length=100)
    resource_type = models.CharField(max_length=50)
    resource_id = models.CharField(max_length=50, blank=True, default='')
    details = models.TextField(blank=True, default='')
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"Audit: {self.action} on {self.resource_type}:{self.resource_id} at {self.timestamp}"
