from django.urls import path
from .views import (
    AiGenerateTitleView,
    AiGenerateSummaryView,
    AiSuggestTagsView,
    AiClassifyCategoryView,
    AiImproveWritingView,
)

urlpatterns = [
    path('generate-title/', AiGenerateTitleView.as_view(), name='ai-generate-title'),
    path('generate-summary/', AiGenerateSummaryView.as_view(), name='ai-generate-summary'),
    path('suggest-tags/', AiSuggestTagsView.as_view(), name='ai-suggest-tags'),
    path('classify-category/', AiClassifyCategoryView.as_view(), name='ai-classify-category'),
    path('improve-writing/', AiImproveWritingView.as_view(), name='ai-improve-writing'),
]
