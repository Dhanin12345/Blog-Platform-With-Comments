from django.contrib import admin
from django.contrib.auth.models import Group
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Follow

# Unregister unused default Django Group model
try:
    admin.site.unregister(Group)
except Exception:
    pass


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'role', 'is_email_verified', 'is_staff', 'is_active')
    list_filter = ('role', 'is_email_verified', 'is_staff', 'is_active')
    search_fields = ('username', 'email', 'bio')
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Custom Profile', {
            'fields': ('role', 'bio', 'avatar', 'website', 'location', 'is_email_verified')
        }),
    )


@admin.register(Follow)
class FollowAdmin(admin.ModelAdmin):
    list_display = ('follower', 'following', 'created_at')
    search_fields = ('follower__username', 'following__username')
