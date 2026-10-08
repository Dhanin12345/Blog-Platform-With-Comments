from django.contrib import admin
from .models import DailyMetric, PostView


@admin.register(DailyMetric)
class DailyMetricAdmin(admin.ModelAdmin):
    list_display = ('author', 'date', 'views_count', 'likes_count', 'comments_count', 'followers_count')
    list_filter = ('date',)


@admin.register(PostView)
class PostViewAdmin(admin.ModelAdmin):
    list_display = ('post', 'user', 'ip_address', 'viewed_at')
    list_filter = ('viewed_at',)
