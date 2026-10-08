from django.conf import settings
from django.db import models


class AiGenerationLog(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='ai_requests',
    )
    task_type = models.CharField(max_length=50)
    prompt_summary = models.TextField(blank=True, default='')
    tokens_used = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        username = self.user.username if self.user else "Anonymous"
        return f"AI Task: {self.task_type} by {username} at {self.created_at}"
