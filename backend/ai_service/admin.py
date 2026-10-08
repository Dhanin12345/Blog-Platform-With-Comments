from django.contrib import admin
from .models import AiGenerationLog


@admin.register(AiGenerationLog)
class AiGenerationLogAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'task_type', 'tokens_used', 'created_at')
    list_filter = ('task_type', 'created_at')
