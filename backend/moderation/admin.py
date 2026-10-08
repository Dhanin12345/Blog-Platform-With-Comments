from django.contrib import admin
from .models import Report, AuditLog


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ('id', 'reporter', 'target_type', 'reason', 'status', 'action_taken', 'reviewed_by', 'created_at')
    list_filter = ('target_type', 'reason', 'status')
    search_fields = ('details', 'reporter__username')


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'action', 'resource_type', 'resource_id', 'timestamp')
    list_filter = ('action', 'resource_type')
    search_fields = ('details', 'user__username', 'resource_id')
