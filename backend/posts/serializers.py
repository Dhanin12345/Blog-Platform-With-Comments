from rest_framework import serializers
from django.utils import timezone
from .models import Post, Category, Tag, PostLike, Bookmark, PostStatus
from users.serializers import AuthorSummarySerializer


class SubCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'icon']


class CategorySerializer(serializers.ModelSerializer):
    subcategories = SubCategorySerializer(many=True, read_only=True)
    posts_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'icon', 'parent', 'subcategories', 'posts_count']

    def get_posts_count(self, obj):
        return obj.posts.filter(status=PostStatus.PUBLISHED).count()


class TagSerializer(serializers.ModelSerializer):
    posts_count = serializers.SerializerMethodField()

    class Meta:
        model = Tag
        fields = ['id', 'name', 'slug', 'posts_count']

    def get_posts_count(self, obj):
        return obj.posts.filter(status=PostStatus.PUBLISHED).count()


class PostListSerializer(serializers.ModelSerializer):
    author = AuthorSummarySerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    is_liked = serializers.SerializerMethodField()
    is_bookmarked = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            'id', 'title', 'slug', 'excerpt', 'featured_image',
            'category', 'tags', 'author', 'status', 'reading_time',
            'published_at', 'views_count', 'likes_count',
            'bookmarks_count', 'comments_count', 'created_at',
            'is_liked', 'is_bookmarked'
        ]

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return PostLike.objects.filter(post=obj, user=request.user).exists()

    def get_is_bookmarked(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return Bookmark.objects.filter(post=obj, user=request.user).exists()


class PostDetailSerializer(serializers.ModelSerializer):
    author = AuthorSummarySerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    is_liked = serializers.SerializerMethodField()
    is_bookmarked = serializers.SerializerMethodField()
    is_author = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            'id', 'title', 'slug', 'excerpt', 'content', 'featured_image',
            'category', 'tags', 'author', 'status', 'reading_time',
            'published_at', 'scheduled_for', 'meta_title', 'meta_description',
            'meta_keywords', 'views_count', 'likes_count', 'bookmarks_count',
            'comments_count', 'created_at', 'updated_at',
            'is_liked', 'is_bookmarked', 'is_author'
        ]

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return PostLike.objects.filter(post=obj, user=request.user).exists()

    def get_is_bookmarked(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return Bookmark.objects.filter(post=obj, user=request.user).exists()

    def get_is_author(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return obj.author_id == request.user.id or request.user.role == 'ADMIN'


class PostCreateUpdateSerializer(serializers.ModelSerializer):
    tag_names = serializers.ListField(
        child=serializers.CharField(max_length=50),
        write_only=True,
        required=False,
    )

    class Meta:
        model = Post
        fields = [
            'id', 'title', 'slug', 'excerpt', 'content', 'featured_image',
            'category', 'tag_names', 'status', 'scheduled_for',
            'meta_title', 'meta_description', 'meta_keywords'
        ]
        read_only_fields = ['id', 'slug']

    def create(self, validated_data):
        tag_names = validated_data.pop('tag_names', [])
        user = self.context['request'].user
        status_val = validated_data.get('status', PostStatus.DRAFT)

        published_at = None
        if status_val == PostStatus.PUBLISHED:
            published_at = timezone.now()

        post = Post.objects.create(
            author=user,
            published_at=published_at,
            **validated_data
        )

        for name in tag_names:
            name = name.strip().lstrip('#').lower()
            if name:
                tag, _ = Tag.objects.get_or_create(name=name)
                post.tags.add(tag)

        return post

    def update(self, instance, validated_data):
        tag_names = validated_data.pop('tag_names', None)
        status_val = validated_data.get('status', instance.status)

        if status_val == PostStatus.PUBLISHED and not instance.published_at:
            instance.published_at = timezone.now()

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if tag_names is not None:
            instance.tags.clear()
            for name in tag_names:
                name = name.strip().lstrip('#').lower()
                if name:
                    tag, _ = Tag.objects.get_or_create(name=name)
                    instance.tags.add(tag)

        return instance
