from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import (
    RegisterView,
    MeView,
    ChangePasswordView,
    FollowToggleView,
    AuthorListView,
    AuthorDetailView,
    DemoLoginView,
    UserManagementViewSet,
)

router = DefaultRouter()
router.register(r'manage', UserManagementViewSet, basename='user-manage')

urlpatterns = [
    # Auth
    path('register/', RegisterView.as_view(), name='auth-register'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('demo-login/', DemoLoginView.as_view(), name='demo-login'),
    path('me/', MeView.as_view(), name='user-me'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),

    # Social & Authors
    path('authors/', AuthorListView.as_view(), name='author-list'),
    path('authors/<str:username>/', AuthorDetailView.as_view(), name='author-detail'),
    path('<int:user_id>/follow/', FollowToggleView.as_view(), name='user-follow-toggle'),

    # Management
    path('', include(router.urls)),
]
