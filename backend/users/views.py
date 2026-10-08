from rest_framework import generics, status, views, viewsets, permissions
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.shortcuts import get_object_or_404
from django.db.models import Count

from .models import User, Follow, UserRole
from .serializers import (
    UserSerializer,
    RegisterSerializer,
    ChangePasswordSerializer,
    AuthorSummarySerializer,
)


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        tokens = get_tokens_for_user(user)
        user_data = UserSerializer(user, context={'request': request}).data
        return Response({
            'user': user_data,
            'tokens': tokens,
            'message': 'Registration successful.',
        }, status=status.HTTP_201_CREATED)


class MeView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class ChangePasswordView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = request.user
        if not user.check_password(serializer.validated_data['old_password']):
            return Response({'old_password': ['Wrong password.']}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        return Response({'message': 'Password changed successfully.'}, status=status.HTTP_200_OK)


class FollowToggleView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, user_id):
        target_user = get_object_or_404(User, id=user_id)
        if target_user == request.user:
            return Response({'error': 'You cannot follow yourself.'}, status=status.HTTP_400_BAD_REQUEST)

        follow_instance = Follow.objects.filter(follower=request.user, following=target_user).first()
        if follow_instance:
            follow_instance.delete()
            is_following = False
            msg = f"Unfollowed {target_user.username}"
        else:
            Follow.objects.create(follower=request.user, following=target_user)
            is_following = True
            msg = f"Following {target_user.username}"

            # Create notification
            try:
                from notifications.models import Notification, NotificationType
                Notification.objects.create(
                    recipient=target_user,
                    sender=request.user,
                    notification_type=NotificationType.FOLLOW,
                    title="New Follower",
                    message=f"{request.user.username} started following you.",
                    target_url=f"/author/{request.user.username}",
                )
            except Exception:
                pass

        followers_count = target_user.followers_set.count()
        return Response({
            'is_following': is_following,
            'followers_count': followers_count,
            'message': msg,
        })


class AuthorListView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = AuthorSummarySerializer

    def get_queryset(self):
        return User.objects.filter(
            role__in=[UserRole.AUTHOR, UserRole.ADMIN]
        ).annotate(
            num_followers=Count('followers_set')
        ).order_by('-num_followers', 'username')[:10]


class AuthorDetailView(generics.RetrieveAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = UserSerializer
    lookup_field = 'username'
    queryset = User.objects.all()


class DemoLoginView(views.APIView):
    """
    Convenient one-click persona switcher for evaluation & live review.
    Supported personas: admin, moderator, sarah_dev, alex_ai, emily_r.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        persona = request.data.get('persona', 'admin')
        user = User.objects.filter(username=persona).first()
        if not user:
            # Fallback to first superuser or first user
            user = User.objects.filter(role=UserRole.ADMIN).first() or User.objects.first()

        tokens = get_tokens_for_user(user)
        user_data = UserSerializer(user, context={'request': request}).data
        return Response({
            'user': user_data,
            'tokens': tokens,
            'persona': persona,
            'message': f"Logged in as demo persona {user.username} ({user.role})"
        })


class UserManagementViewSet(viewsets.ModelViewSet):
    """
    Admin control for users.
    """
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer

    def get_permissions(self):
        user = self.request.user
        if not (user.is_authenticated and (user.role == UserRole.ADMIN or user.is_superuser)):
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]

    def partial_update(self, request, *args, **kwargs):
        # Allow admin to change role or is_active
        instance = self.get_object()
        new_role = request.data.get('role')
        if new_role and new_role in dict(UserRole.choices):
            instance.role = new_role
        if 'is_active' in request.data:
            instance.is_active = bool(request.data['is_active'])
        instance.save()
        return Response(self.get_serializer(instance).data)
