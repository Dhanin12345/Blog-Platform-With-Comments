from rest_framework import serializers
from .models import Comment, CommentLike, CommentStatus
from users.serializers import AuthorSummarySerializer


class CommentReplySerializer(serializers.ModelSerializer):
    author = AuthorSummarySerializer(read_only=True)
    is_liked = serializers.SerializerMethodField()
    is_author = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = [
            'id', 'post_id', 'parent_id', 'author', 'content',
            'status', 'is_pinned', 'likes_count', 'created_at',
            'updated_at', 'is_liked', 'is_author'
        ]

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return CommentLike.objects.filter(comment=obj, user=request.user).exists()

    def get_is_author(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return obj.author_id == request.user.id or request.user.role == 'ADMIN'


class CommentSerializer(serializers.ModelSerializer):
    author = AuthorSummarySerializer(read_only=True)
    replies = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    is_author = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = [
            'id', 'post_id', 'parent_id', 'author', 'content',
            'status', 'is_pinned', 'likes_count', 'created_at',
            'updated_at', 'replies', 'is_liked', 'is_author'
        ]

    def get_replies(self, obj):
        replies_qs = obj.replies.filter(status=CommentStatus.APPROVED).order_by('created_at')
        return CommentReplySerializer(replies_qs, many=True, context=self.context).data

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return CommentLike.objects.filter(comment=obj, user=request.user).exists()

    def get_is_author(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return obj.author_id == request.user.id or request.user.role == 'ADMIN'


class CommentCreateSerializer(serializers.ModelSerializer):
    parent = serializers.PrimaryKeyRelatedField(
        queryset=Comment.objects.all(),
        required=False,
        allow_null=True
    )

    class Meta:
        model = Comment
        fields = ['id', 'content', 'parent']
