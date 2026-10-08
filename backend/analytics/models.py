from django.conf import settings
from django.db import models


class DailyMetric(models.Model):
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='daily_metrics',
    )
    date = models.DateField()
    views_count = models.PositiveIntegerField(default=0)
    likes_count = models.PositiveIntegerField(default=0)
    comments_count = models.PositiveIntegerField(default=0)
    followers_count = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ('author', 'date')
        ordering = ['date']

    def __str__(self):
        return f"Metrics for {self.author.username} on {self.date}"


class PostView(models.Model):
    post = models.ForeignKey(
        'posts.Post',
        on_delete=models.CASCADE,
        related_name='views_history',
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='viewed_posts',
    )
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=300, blank=True, default='')
    viewed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-viewed_at']

    def __str__(self):
        return f"View on {self.post.title} at {self.viewed_at}"
