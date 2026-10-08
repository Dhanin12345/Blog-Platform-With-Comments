from rest_framework import generics, permissions, status, views
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import F

from .models import Comment, CommentLike, CommentStatus
from .serializers import CommentSerializer, CommentCreateSerializer
from posts.models import Post
from notifications.models import Notification, NotificationType


class PostCommentListCreateView(generics.ListCreateAPIView):
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CommentCreateSerializer
        return CommentSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_post(self):
        slug_or_id = self.kwargs['post_slug']
        if slug_or_id.isdigit():
            return get_object_or_404(Post, pk=int(slug_or_id))
        return get_object_or_404(Post, slug=slug_or_id)

    def get_queryset(self):
        post = self.get_post()
        return Comment.objects.filter(
            post=post,
            parent__isnull=True,
            status=CommentStatus.APPROVED,
        ).select_related('author').prefetch_related('replies')

    def create(self, request, *args, **kwargs):
        serializer = CommentCreateSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        post = self.get_post()
        comment = serializer.save(author=request.user, post=post)

        # Update comments count on post
        Post.objects.filter(pk=post.pk).update(comments_count=F('comments_count') + 1)

        # Send notification
        try:
            if comment.parent and comment.parent.author != request.user:
                Notification.objects.create(
                    recipient=comment.parent.author,
                    sender=request.user,
                    notification_type=NotificationType.REPLY,
                    title="New Reply to Your Comment",
                    message=f"{request.user.username} replied to your comment on '{post.title}'.",
                    target_url=f"/post/{post.slug}#comment-{comment.id}",
                )
            elif post.author != request.user:
                Notification.objects.create(
                    recipient=post.author,
                    sender=request.user,
                    notification_type=NotificationType.COMMENT,
                    title="New Comment on Your Post",
                    message=f"{request.user.username} commented on '{post.title}'.",
                    target_url=f"/post/{post.slug}#comment-{comment.id}",
                )
        except Exception:
            pass

        return Response(CommentSerializer(comment, context={'request': request}).data, status=status.HTTP_201_CREATED)


class CommentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def check_object_permissions(self, request, obj):
        super().check_object_permissions(request, obj)
        if request.method not in permissions.SAFE_METHODS:
            is_mod = request.user.role in ['ADMIN', 'MODERATOR'] or request.user.is_superuser
            is_owner = obj.author == request.user
            if not (is_owner or is_mod):
                self.permission_denied(request, message="You do not have permission to edit/delete this comment.")

    def perform_destroy(self, instance):
        post = instance.post
        instance.delete()
        Post.objects.filter(pk=post.pk).update(comments_count=F('comments_count') - 1)


class CommentLikeToggleView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        comment = get_object_or_404(Comment, pk=pk)
        like_obj = CommentLike.objects.filter(user=request.user, comment=comment).first()

        if like_obj:
            like_obj.delete()
            Comment.objects.filter(pk=comment.pk).update(likes_count=F('likes_count') - 1)
            comment.refresh_from_db()
            liked = False
        else:
            CommentLike.objects.create(user=request.user, comment=comment)
            Comment.objects.filter(pk=comment.pk).update(likes_count=F('likes_count') + 1)
            comment.refresh_from_db()
            liked = True

        return Response({
            'liked': liked,
            'likes_count': comment.likes_count,
        })


class CommentPinToggleView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        comment = get_object_or_404(Comment, pk=pk)
        post = comment.post
        is_allowed = post.author == request.user or request.user.role == 'ADMIN' or request.user.is_superuser
        if not is_allowed:
            return Response({'error': 'Only the post author or admin can pin comments.'}, status=status.HTTP_403_FORBIDDEN)

        comment.is_pinned = not comment.is_pinned
        comment.save()

        return Response({
            'is_pinned': comment.is_pinned,
            'message': f"Comment {'pinned' if comment.is_pinned else 'unpinned'} successfully."
        })
