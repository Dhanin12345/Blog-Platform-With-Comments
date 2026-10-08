from django.contrib.auth.models import AbstractUser
from django.db import models


class UserRole(models.TextChoices):
    ADMIN = 'ADMIN', 'Admin'
    AUTHOR = 'AUTHOR', 'Author'
    MODERATOR = 'MODERATOR', 'Moderator'
    USER = 'USER', 'User'


class User(AbstractUser):
    email = models.EmailField(unique=True)
    role = models.CharField(
        max_length=20,
        choices=UserRole.choices,
        default=UserRole.USER,
        db_index=True,
    )
    bio = models.TextField(blank=True, default='')
    avatar = models.CharField(max_length=500, blank=True, default='')
    website = models.URLField(blank=True, default='')
    location = models.CharField(max_length=100, blank=True, default='')
    is_email_verified = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def is_admin(self):
        return self.role == UserRole.ADMIN or self.is_superuser

    def is_author(self):
        return self.role in [UserRole.AUTHOR, UserRole.ADMIN]

    def is_moderator(self):
        return self.role in [UserRole.MODERATOR, UserRole.ADMIN]

    def __str__(self):
        return f"{self.username} ({self.role})"


class Follow(models.Model):
    follower = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='following_set',
    )
    following = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='followers_set',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('follower', 'following')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.follower.username} follows {self.following.username}"
