import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from posts.models import Post, Category, Tag, PostStatus
from comments.models import Comment

User = get_user_model()


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def test_author(db):
    return User.objects.create_user(
        username="test_author",
        email="author@example.com",
        password="TestPassword123!",
        role="AUTHOR"
    )


@pytest.fixture
def test_user(db):
    return User.objects.create_user(
        username="test_user",
        email="user@example.com",
        password="TestPassword123!",
        role="USER"
    )


@pytest.fixture
def test_category(db):
    return Category.objects.create(name="Engineering", slug="engineering")


@pytest.mark.django_db
def test_user_registration(api_client):
    payload = {
        "username": "new_writer",
        "email": "new_writer@example.com",
        "password": "StrongPassword123!",
        "password2": "StrongPassword123!",
        "role": "AUTHOR",
        "bio": "Writing about distributed systems."
    }
    response = api_client.post("/api/auth/register/", payload, format="json")
    assert response.status_code == 201
    assert "tokens" in response.data
    assert "access" in response.data["tokens"]
    assert response.data["user"]["username"] == "new_writer"


@pytest.mark.django_db
def test_demo_login(api_client, test_author):
    response = api_client.post("/api/auth/demo-login/", {"persona": "test_author"}, format="json")
    assert response.status_code == 200
    assert "tokens" in response.data
    assert response.data["user"]["username"] == "test_author"


@pytest.mark.django_db
def test_post_creation_and_listing(api_client, test_author, test_category):
    api_client.force_authenticate(user=test_author)

    create_data = {
        "title": "Deep Dive into Distributed Caching",
        "content": "This article explores cache invalidation patterns and consistent hashing.",
        "category": test_category.id,
        "tag_names": ["caching", "architecture"],
        "status": "PUBLISHED"
    }
    create_res = api_client.post("/api/posts/", create_data, format="json")
    assert create_res.status_code == 201
    assert create_res.data["title"] == "Deep Dive into Distributed Caching"
    slug = create_res.data["slug"]

    # Public list
    api_client.force_authenticate(user=None)
    list_res = api_client.get("/api/posts/")
    assert list_res.status_code == 200
    assert len(list_res.data["results"]) >= 1

    # Detail
    detail_res = api_client.get(f"/api/posts/{slug}/")
    assert detail_res.status_code == 200
    assert detail_res.data["title"] == "Deep Dive into Distributed Caching"


@pytest.mark.django_db
def test_comments_and_nested_replies(api_client, test_author, test_user, test_category):
    post = Post.objects.create(
        author=test_author,
        title="Microservices Patterns",
        content="Exploring service mesh, tracing, and event-driven architectures.",
        status=PostStatus.PUBLISHED,
        category=test_category
    )

    api_client.force_authenticate(user=test_user)
    comment_res = api_client.post(
        f"/api/comments/post/{post.slug}/",
        {"content": "Outstanding technical writeup!"},
        format="json"
    )
    assert comment_res.status_code == 201
    comment_id = comment_res.data["id"]

    # Reply to comment
    api_client.force_authenticate(user=test_author)
    reply_res = api_client.post(
        f"/api/comments/post/{post.slug}/",
        {"content": "Thank you for reading!", "parent": comment_id},
        format="json"
    )
    assert reply_res.status_code == 201

    # Fetch comments tree
    api_client.force_authenticate(user=None)
    comments_list = api_client.get(f"/api/comments/post/{post.slug}/")
    assert comments_list.status_code == 200
    top_comment = comments_list.data["results"][0]
    assert top_comment["id"] == comment_id
    assert len(top_comment["replies"]) == 1
    assert top_comment["replies"][0]["content"] == "Thank you for reading!"


@pytest.mark.django_db
def test_like_and_bookmark(api_client, test_author, test_user, test_category):
    post = Post.objects.create(
        author=test_author,
        title="Zero Trust Architecture",
        content="Never trust, always verify.",
        status=PostStatus.PUBLISHED,
        category=test_category
    )

    api_client.force_authenticate(user=test_user)
    like_res = api_client.post(f"/api/posts/{post.slug}/like/")
    assert like_res.status_code == 200
    assert like_res.data["liked"] is True
    assert like_res.data["likes_count"] == 1

    bm_res = api_client.post(f"/api/posts/{post.slug}/bookmark/")
    assert bm_res.status_code == 200
    assert bm_res.data["bookmarked"] is True


@pytest.mark.django_db
def test_ai_writing_assistant(api_client, test_author):
    api_client.force_authenticate(user=test_author)

    res = api_client.post(
        "/api/ai/suggest-tags/",
        {"title": "React and TypeScript with Vite", "content": "Frontend engineering with modern state."},
        format="json"
    )
    assert res.status_code == 200
    assert "tags" in res.data
    assert len(res.data["tags"]) > 0

    title_res = api_client.post(
        "/api/ai/generate-title/",
        {"content": "A deep analysis of artificial intelligence and deep neural networks."},
        format="json"
    )
    assert title_res.status_code == 200
    assert len(title_res.data["titles"]) == 5
