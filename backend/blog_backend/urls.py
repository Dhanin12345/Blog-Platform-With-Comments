from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .media_views import FileUploadView
from .views import api_root_view, backend_root_redirect


urlpatterns = [
    # Root landing page
    path('', backend_root_redirect, name='backend-root'),

    # Admin
    path('admin/', admin.site.urls),

    # API Root
    path('api/', api_root_view, name='api-root'),

    # API Endpoints
    path('api/auth/', include('users.urls')),
    path('api/users/', include('users.urls')),
    path('api/posts/', include('posts.urls')),
    path('api/comments/', include('comments.urls')),
    path('api/moderation/', include('moderation.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/analytics/', include('analytics.urls')),
    path('api/ai/', include('ai_service.urls')),
    path('api/upload/', FileUploadView.as_view(), name='file-upload'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
