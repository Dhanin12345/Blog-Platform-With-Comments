from django.contrib import admin
from .models import Comment, CommentLike


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('id', 'author', 'post', 'status', 'is_pinned', 'likes_count', 'created_at')
    list_filter = ('status', 'is_pinned', 'created_at')
    search_fields = ('content', 'author__username', 'post__title')


@admin.register(CommentLike)
class CommentLikeAdmin(admin.ModelAdmin):
    list_display = ('user', 'comment', 'created_at')
