from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q, F
from django.utils import timezone
from django.shortcuts import get_object_or_404

from .models import Post, Category, Tag, PostLike, Bookmark, PostStatus
from .serializers import (
    PostListSerializer,
    PostDetailSerializer,
    PostCreateUpdateSerializer,
    CategorySerializer,
    TagSerializer,
)
from users.models import Follow


class IsAuthorOrAdminOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return (
            request.user.is_authenticated and
            (obj.author == request.user or request.user.role == 'ADMIN' or request.user.is_superuser)
        )


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    lookup_field = 'slug'

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]


class TagViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    lookup_field = 'slug'


class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all().select_related('author', 'category').prefetch_related('tags')
    lookup_field = 'slug'

    def get_permissions(self):
        if self.action in ['create', 'my_posts', 'my_bookmarks']:
            return [permissions.IsAuthenticated()]
        if self.action in ['like', 'bookmark']:
            return [permissions.IsAuthenticated()]
        if self.action in ['update', 'partial_update', 'destroy']:
            return [IsAuthorOrAdminOrReadOnly()]
        return [permissions.AllowAny()]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return PostCreateUpdateSerializer
        if self.action == 'retrieve':
            return PostDetailSerializer
        return PostListSerializer

    def get_queryset(self):
        queryset = super().get_queryset()

        # Handle scheduled posts auto-publishing check
        now = timezone.now()
        Post.objects.filter(
            status=PostStatus.SCHEDULED,
            scheduled_for__lte=now
        ).update(status=PostStatus.PUBLISHED, published_at=now)

        user = self.request.user

        # For public views, only show PUBLISHED posts, unless viewing own posts or admin/moderator
        if self.action in ['list', 'search', 'trending']:
            queryset = queryset.filter(status=PostStatus.PUBLISHED)
        elif self.action in ['retrieve']:
            # If draft, allow author or admin/moderator to preview
            if not (user.is_authenticated and (user.role in ['ADMIN', 'MODERATOR'] or user.is_superuser)):
                if user.is_authenticated:
                    queryset = queryset.filter(Q(status=PostStatus.PUBLISHED) | Q(author=user))
                else:
                    queryset = queryset.filter(status=PostStatus.PUBLISHED)

        # Filters
        category_slug = self.request.query_params.get('category')
        if category_slug:
            queryset = queryset.filter(Q(category__slug=category_slug) | Q(category__parent__slug=category_slug))

        tag_slug = self.request.query_params.get('tag')
        if tag_slug:
            queryset = queryset.filter(tags__slug=tag_slug)

        author_username = self.request.query_params.get('author')
        if author_username:
            queryset = queryset.filter(author__username=author_username)

        # Search query
        q = self.request.query_params.get('q')
        if q:
            queryset = queryset.filter(
                Q(title__icontains=q) |
                Q(content__icontains=q) |
                Q(excerpt__icontains=q) |
                Q(tags__name__icontains=q) |
                Q(category__name__icontains=q) |
                Q(author__username__icontains=q)
            ).distinct()

        # Sort order
        sort = self.request.query_params.get('sort', 'latest')
        if sort in ['most_viewed', 'views']:
            queryset = queryset.order_by('-views_count', '-published_at')
        elif sort in ['most_liked', 'likes']:
            queryset = queryset.order_by('-likes_count', '-published_at')
        elif sort in ['most_commented', 'comments']:
            queryset = queryset.order_by('-comments_count', '-published_at')
        elif sort == 'trending':
            queryset = queryset.order_by(
                F('views_count') + (F('likes_count') * 3) + (F('comments_count') * 2)
            ).reverse()
        else:
            # Default 'latest'
            queryset = queryset.order_by('-published_at', '-created_at')

        return queryset

    @action(detail=True, methods=['post'])
    def like(self, request, slug=None):
        post = self.get_object()
        like_obj = PostLike.objects.filter(user=request.user, post=post).first()

        if like_obj:
            like_obj.delete()
            Post.objects.filter(pk=post.pk).update(likes_count=F('likes_count') - 1)
            post.refresh_from_db()
            liked = False
            msg = "Post unliked"
        else:
            PostLike.objects.create(user=request.user, post=post)
            Post.objects.filter(pk=post.pk).update(likes_count=F('likes_count') + 1)
            post.refresh_from_db()
            liked = True
            msg = "Post liked"

            # Create notification for post author
            if post.author != request.user:
                try:
                    from notifications.models import Notification, NotificationType
                    Notification.objects.create(
                        recipient=post.author,
                        sender=request.user,
                        notification_type=NotificationType.LIKE,
                        title="New Post Like",
                        message=f"{request.user.username} liked your post '{post.title}'.",
                        target_url=f"/post/{post.slug}",
                    )
                except Exception:
                    pass

        return Response({
            'liked': liked,
            'likes_count': post.likes_count,
            'message': msg
        })

    @action(detail=True, methods=['post'])
    def bookmark(self, request, slug=None):
        post = self.get_object()
        bm = Bookmark.objects.filter(user=request.user, post=post).first()

        if bm:
            bm.delete()
            Post.objects.filter(pk=post.pk).update(bookmarks_count=F('bookmarks_count') - 1)
            post.refresh_from_db()
            bookmarked = False
            msg = "Removed from bookmarks"
        else:
            Bookmark.objects.create(user=request.user, post=post)
            Post.objects.filter(pk=post.pk).update(bookmarks_count=F('bookmarks_count') + 1)
            post.refresh_from_db()
            bookmarked = True
            msg = "Saved to bookmarks"

        return Response({
            'bookmarked': bookmarked,
            'bookmarks_count': post.bookmarks_count,
            'message': msg
        })

    @action(detail=False, methods=['get'])
    def feed(self, request):
        """
        Personalized feed based on followed authors and trending posts.
        """
        if not request.user.is_authenticated:
            # Fallback for anonymous users: top latest published
            posts = Post.objects.filter(status=PostStatus.PUBLISHED).order_by('-published_at')[:20]
        else:
            following_ids = Follow.objects.filter(follower=request.user).values_list('following_id', flat=True)
            posts = Post.objects.filter(
                status=PostStatus.PUBLISHED,
                author_id__in=following_ids
            ).order_by('-published_at')

            # If fewer than 5 posts in feed from followed authors, backfill with general published posts
            if posts.count() < 5:
                extra = Post.objects.filter(
                    status=PostStatus.PUBLISHED
                ).exclude(author_id__in=following_ids).order_by('-likes_count', '-published_at')[:10]
                posts = list(posts) + list(extra)

        page = self.paginate_queryset(posts)
        if page is not None:
            serializer = PostListSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)

        serializer = PostListSerializer(posts, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def trending(self, request):
        trending_posts = Post.objects.filter(
            status=PostStatus.PUBLISHED
        ).order_by(
            F('views_count') + (F('likes_count') * 3) + (F('comments_count') * 2)
        ).reverse()[:6]

        serializer = PostListSerializer(trending_posts, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def my_posts(self, request):
        user = request.user
        posts = Post.objects.filter(author=user).order_by('-created_at')

        stats = {
            'total': posts.count(),
            'published': posts.filter(status=PostStatus.PUBLISHED).count(),
            'draft': posts.filter(status=PostStatus.DRAFT).count(),
            'scheduled': posts.filter(status=PostStatus.SCHEDULED).count(),
            'archived': posts.filter(status=PostStatus.ARCHIVED).count(),
        }

        page = self.paginate_queryset(posts)
        if page is not None:
            serializer = PostListSerializer(page, many=True, context={'request': request})
            response = self.get_paginated_response(serializer.data)
            response.data['stats'] = stats
            return response

        serializer = PostListSerializer(posts, many=True, context={'request': request})
        return Response({'results': serializer.data, 'stats': stats})

    @action(detail=False, methods=['get'])
    def my_bookmarks(self, request):
        bookmarks = Bookmark.objects.filter(user=request.user).select_related('post__author', 'post__category')
        posts = [b.post for b in bookmarks if b.post.status == PostStatus.PUBLISHED]

        page = self.paginate_queryset(posts)
        if page is not None:
            serializer = PostListSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)

        serializer = PostListSerializer(posts, many=True, context={'request': request})
        return Response(serializer.data)
