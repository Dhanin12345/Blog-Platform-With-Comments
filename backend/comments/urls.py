from django.urls import path
from .views import (
    PostCommentListCreateView,
    CommentDetailView,
    CommentLikeToggleView,
    CommentPinToggleView,
)

urlpatterns = [
    path('post/<str:post_slug>/', PostCommentListCreateView.as_view(), name='post-comments'),
    path('<int:pk>/', CommentDetailView.as_view(), name='comment-detail'),
    path('<int:pk>/like/', CommentLikeToggleView.as_view(), name='comment-like-toggle'),
    path('<int:pk>/pin/', CommentPinToggleView.as_view(), name='comment-pin-toggle'),
]
