from django.urls import path
from .views import AuthorAnalyticsView, PlatformAnalyticsView, RecordPostView

urlpatterns = [
    path('author/', AuthorAnalyticsView.as_view(), name='author-analytics'),
    path('platform/', PlatformAnalyticsView.as_view(), name='platform-analytics'),
    path('record-view/<str:post_slug>/', RecordPostView.as_view(), name='record-post-view'),
]
