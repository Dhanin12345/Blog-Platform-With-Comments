from django.http import HttpResponse
from django.shortcuts import redirect
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


LANDING_HTML = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BlogSphere — Architecture Hub &amp; API Explorer</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #0b0f19;
      --card-bg: rgba(22, 28, 45, 0.75);
      --card-border: rgba(255, 255, 255, 0.08);
      --primary: #6366f1;
      --primary-hover: #4f46e5;
      --accent: #ec4899;
      --success: #10b981;
      --text: #f3f4f6;
      --text-muted: #9ca3af;
      --font-sans: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      --font-mono: 'JetBrains Mono', monospace;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--bg);
      background-image: 
        radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.16) 0px, transparent 50%),
        radial-gradient(at 100% 100%, rgba(236, 72, 153, 0.12) 0px, transparent 50%),
        radial-gradient(at 50% 50%, rgba(16, 185, 129, 0.05) 0px, transparent 50%);
      color: var(--text);
      font-family: var(--font-sans);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 3rem 1.5rem;
      line-height: 1.6;
    }
    .container {
      max-width: 980px;
      width: 100%;
    }
    .header {
      text-align: center;
      margin-bottom: 2.5rem;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.35rem 0.85rem;
      border-radius: 9999px;
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #34d399;
      font-size: 0.825rem;
      font-weight: 600;
      margin-bottom: 1.25rem;
    }
    .badge-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 10px #10b981;
    }
    h1 {
      font-size: 2.6rem;
      font-weight: 800;
      letter-spacing: -0.04em;
      margin-bottom: 0.75rem;
      background: linear-gradient(135deg, #ffffff 40%, #a5b4fc 80%, #ec4899 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .subtitle {
      color: var(--text-muted);
      font-size: 1.1rem;
      max-width: 640px;
      margin: 0 auto 2rem;
    }
    .action-bar {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
      margin-bottom: 3rem;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.6rem;
      padding: 0.85rem 1.65rem;
      border-radius: 12px;
      font-weight: 700;
      font-size: 0.95rem;
      text-decoration: none;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      cursor: pointer;
    }
    .btn-primary {
      background: linear-gradient(135deg, #6366f1, #a855f7);
      color: #fff;
      box-shadow: 0 10px 25px -5px rgba(99, 102, 241, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.15);
    }
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 15px 30px -5px rgba(99, 102, 241, 0.6);
    }
    .btn-secondary {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--card-border);
      color: #e0e7ff;
      backdrop-filter: blur(10px);
    }
    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.1);
      transform: translateY(-2px);
      border-color: rgba(99, 102, 241, 0.4);
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(290px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2.5rem;
    }
    .card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 18px;
      padding: 1.5rem;
      backdrop-filter: blur(16px);
      box-shadow: 0 15px 35px -10px rgba(0, 0, 0, 0.5);
      transition: transform 0.2s, border-color 0.2s;
    }
    .card:hover {
      border-color: rgba(99, 102, 241, 0.35);
      transform: translateY(-3px);
    }
    .card-title {
      font-size: 1.15rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .card-desc {
      color: var(--text-muted);
      font-size: 0.88rem;
      margin-bottom: 1.25rem;
    }
    .endpoint-list {
      list-style: none;
      font-family: var(--font-mono);
      font-size: 0.825rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .endpoint-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(0, 0, 0, 0.25);
      padding: 0.45rem 0.75rem;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.04);
    }
    .endpoint-item a {
      color: #818cf8;
      text-decoration: none;
    }
    .endpoint-item a:hover {
      text-decoration: underline;
    }
    .method {
      padding: 0.15rem 0.45rem;
      border-radius: 4px;
      font-weight: 700;
      font-size: 0.7rem;
    }
    .method-get { background: rgba(16, 185, 129, 0.2); color: #34d399; }
    .persona-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.85rem;
      margin-top: 0.5rem;
    }
    .persona-table th, .persona-table td {
      padding: 0.55rem 0.65rem;
      text-align: left;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }
    .persona-table th {
      color: var(--text-muted);
      font-weight: 600;
    }
    .footer {
      text-align: center;
      font-size: 0.825rem;
      color: var(--text-muted);
      margin-top: auto;
      padding-top: 2rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="badge">
        <span class="badge-dot"></span>
        <span>DJANGO 5.1 ENGINE &bull; CLEAN BLOG PLATFORM RUNNING</span>
      </div>
      <h1>BlogSphere Architecture Hub</h1>
      <p class="subtitle">
        High-Performance Full-Stack Blogging Platform &bull; Nested Discussions &bull; RESTful API Engine
      </p>

      <div class="action-bar">
        <a href="http://localhost:5173" class="btn btn-primary" target="_blank">
          <span>🚀 Launch Modern Web UI (Port 5173)</span>
        </a>
        <a href="/admin/" class="btn btn-secondary">
          <span>👑 Django Management Console</span>
        </a>
        <a href="/api/?format=json" class="btn btn-secondary">
          <span>📡 View Raw JSON Payload</span>
        </a>
      </div>
    </div>

    <div class="grid">
      <!-- Full Stack Architecture -->
      <div class="card">
        <div class="card-title">
          <span>⚡</span>
          <span>Dual-Port Architecture</span>
        </div>
        <p class="card-desc">BlogSphere runs as a decoupled modern full-stack system:</p>
        <div style="background: rgba(0,0,0,0.3); border-radius: 10px; padding: 1rem; font-size: 0.85rem;">
          <div style="margin-bottom: 0.75rem;">
            <strong style="color: #818cf8;">🖥️ Frontend (Port 5173):</strong><br>
            <span style="color: var(--text-muted);">Vite + React 18 &bull; Glassmorphism &bull; Nested Comments &bull; Author Studio &bull; Markdown Engine &bull; Persona Switcher</span>
          </div>
          <div>
            <strong style="color: #34d399;">⚙️ Backend API (Port 8000):</strong><br>
            <span style="color: var(--text-muted);">Django 5 &bull; Django REST Framework &bull; SimpleJWT Auth &bull; RBAC &bull; SQLite ORM</span>
          </div>
        </div>
      </div>

      <!-- Core REST APIs -->
      <div class="card">
        <div class="card-title">
          <span>📡</span>
          <span>Core RESTful API Directory</span>
        </div>
        <p class="card-desc">Click any endpoint to inspect live JSON responses:</p>
        <ul class="endpoint-list">
          <li class="endpoint-item">
            <a href="/api/posts/" target="_blank">/api/posts/</a>
            <span class="method method-get">GET</span>
          </li>
          <li class="endpoint-item">
            <a href="/api/posts/categories/" target="_blank">/api/posts/categories/</a>
            <span class="method method-get">GET</span>
          </li>
          <li class="endpoint-item">
            <a href="/api/posts/tags/" target="_blank">/api/posts/tags/</a>
            <span class="method method-get">GET</span>
          </li>
          <li class="endpoint-item">
            <a href="/api/comments/" target="_blank">/api/comments/</a>
            <span class="method method-get">GET</span>
          </li>
          <li class="endpoint-item">
            <a href="/api/auth/authors/" target="_blank">/api/auth/authors/</a>
            <span class="method method-get">GET</span>
          </li>
        </ul>
      </div>

      <!-- Seed Test Personas -->
      <div class="card">
        <div class="card-title">
          <span>👥</span>
          <span>Platform Personas</span>
        </div>
        <p class="card-desc">Active test accounts with password: <code>Password123!</code></p>
        <table class="persona-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Role</th>
              <th>Capabilities</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>admin</code></td>
              <td><span style="color: #f43f5e; font-weight: 700;">ADMIN</span></td>
              <td>Full Platform &amp; Role Management</td>
            </tr>
            <tr>
              <td><code>moderator</code></td>
              <td><span style="color: #f59e0b; font-weight: 700;">MODERATOR</span></td>
              <td>Content &amp; Flag Moderation</td>
            </tr>
            <tr>
              <td><code>sarah_dev</code></td>
              <td><span style="color: #6366f1; font-weight: 700;">AUTHOR</span></td>
              <td>Post Authoring &amp; Analytics</td>
            </tr>
            <tr>
              <td><code>emily_r</code></td>
              <td><span style="color: #10b981; font-weight: 700;">USER</span></td>
              <td>Comments, Likes, Bookmarks</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="footer">
      BlogSphere Engine &bull; Developed with Django 5 &bull; Django REST Framework &bull; React 18 &bull; Vite
    </div>
  </div>
</body>
</html>
"""


@api_view(['GET'])
@permission_classes([AllowAny])
def api_root_view(request):
    """
    If accessed via a browser (Accept: text/html), render the clean landing page.
    Otherwise return standard JSON payload.
    """
    accept_header = request.META.get('HTTP_ACCEPT', '')
    format_kwarg = request.query_params.get('format', '')

    if 'text/html' in accept_header and format_kwarg != 'json':
        return HttpResponse(LANDING_HTML, content_type='text/html')

    return Response({
        'name': 'BlogSphere RESTful API Engine',
        'version': '1.0.0',
        'status': 'online',
        'endpoints': {
            'auth': request.build_absolute_uri('/api/auth/'),
            'posts': request.build_absolute_uri('/api/posts/'),
            'categories': request.build_absolute_uri('/api/posts/categories/'),
            'tags': request.build_absolute_uri('/api/posts/tags/'),
            'comments': request.build_absolute_uri('/api/comments/'),
            'moderation': request.build_absolute_uri('/api/moderation/'),
            'notifications': request.build_absolute_uri('/api/notifications/'),
            'analytics': request.build_absolute_uri('/api/analytics/'),
            'upload': request.build_absolute_uri('/api/upload/'),
        },
        'frontend_url': 'http://localhost:5173',
        'admin_url': request.build_absolute_uri('/admin/'),
    })


def backend_root_redirect(request):
    """Redirect backend root / to /api/ or serve landing page."""
    accept_header = request.META.get('HTTP_ACCEPT', '')
    if 'text/html' in accept_header:
        return HttpResponse(LANDING_HTML, content_type='text/html')
    return redirect('/api/')
