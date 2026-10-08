from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ReportCreateView, ReportManageViewSet, AuditLogListView

router = DefaultRouter()
router.register(r'reports', ReportManageViewSet, basename='moderation-reports')

urlpatterns = [
    path('report/', ReportCreateView.as_view(), name='file-report'),
    path('audit-logs/', AuditLogListView.as_view(), name='audit-logs'),
    path('', include(router.urls)),
]
