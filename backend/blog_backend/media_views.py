import os
import uuid
from django.conf import settings
from rest_framework import views, permissions, status
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser


class FileUploadView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        file_obj = request.FILES.get('file') or request.FILES.get('image')
        if not file_obj:
            return Response({'error': 'No file uploaded.'}, status=status.HTTP_400_BAD_REQUEST)

        # 5MB limit
        if file_obj.size > 5 * 1024 * 1024:
            return Response({'error': 'File size exceeds 5MB limit.'}, status=status.HTTP_400_BAD_REQUEST)

        allowed_exts = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']
        ext = os.path.splitext(file_obj.name)[1].lower()
        if ext not in allowed_exts:
            return Response({'error': f'Unsupported format. Allowed: {", ".join(allowed_exts)}'}, status=status.HTTP_400_BAD_REQUEST)

        upload_dir = os.path.join(settings.MEDIA_ROOT, 'uploads')
        os.makedirs(upload_dir, exist_ok=True)

        filename = f"{uuid.uuid4().hex[:12]}{ext}"
        filepath = os.path.join(upload_dir, filename)

        with open(filepath, 'wb+') as destination:
            for chunk in file_obj.chunks():
                destination.write(chunk)

        file_url = f"{settings.MEDIA_URL}uploads/{filename}"
        return Response({
            'url': file_url,
            'filename': filename,
            'size': file_obj.size,
            'message': 'File uploaded successfully'
        }, status=status.HTTP_201_CREATED)
