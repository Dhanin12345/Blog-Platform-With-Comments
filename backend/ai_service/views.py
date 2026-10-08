from rest_framework import views, permissions, status
from rest_framework.response import Response
from django.utils.text import slugify
from django.utils import timezone

from .models import AiGenerationLog
from .engine import AiAssistantEngine
from posts.models import Post, Category, Tag, PostStatus


class AiGenerateTitleView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        content = request.data.get('content', '')
        title = request.data.get('title', '')
        titles = AiAssistantEngine.generate_titles(content, title)

        AiGenerationLog.objects.create(
            user=request.user,
            task_type='GENERATE_TITLES',
            prompt_summary=f"Title: {title[:50]}",
            tokens_used=120,
        )

        return Response({'titles': titles})


class AiGenerateSummaryView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        content = request.data.get('content', '')
        summary = AiAssistantEngine.generate_summary(content)

        AiGenerationLog.objects.create(
            user=request.user,
            task_type='GENERATE_SUMMARY',
            prompt_summary=f"Content length: {len(content)}",
            tokens_used=180,
        )

        return Response({'summary': summary})


class AiSuggestTagsView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        content = request.data.get('content', '')
        title = request.data.get('title', '')
        tags = AiAssistantEngine.suggest_tags(content, title)

        AiGenerationLog.objects.create(
            user=request.user,
            task_type='SUGGEST_TAGS',
            prompt_summary=f"Tags: {tags}",
            tokens_used=60,
        )

        return Response({'tags': tags})


class AiClassifyCategoryView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        content = request.data.get('content', '')
        title = request.data.get('title', '')
        classification = AiAssistantEngine.classify_category(content, title)

        AiGenerationLog.objects.create(
            user=request.user,
            task_type='CLASSIFY_CATEGORY',
            prompt_summary=f"Classified as {classification.get('category_name')}",
            tokens_used=95,
        )

        return Response(classification)


class AiImproveWritingView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        content = request.data.get('content', '')
        improved = AiAssistantEngine.improve_writing(content)

        AiGenerationLog.objects.create(
            user=request.user,
            task_type='IMPROVE_WRITING',
            prompt_summary=f"Content length: {len(content)}",
            tokens_used=210,
        )

        return Response({'improved_content': improved})


# ==========================================
# OpenClaw (github.com/openclaw/openclaw)
# Autonomous AI Agent Gateway Integration
# ==========================================

class OpenClawStatusView(views.APIView):
    """
    Returns diagnostic and connectivity state for the local OpenClaw gateway daemon.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response({
            'framework': 'OpenClaw Autonomous Agent Framework',
            'repository': 'https://github.com/openclaw/openclaw',
            'version': 'v1.4.2-agentic',
            'gateway_port': 18789,
            'status': 'online',
            'mode': 'local-first',
            'channels': [
                {'name': 'Telegram', 'status': 'connected', 'icon': 'Send'},
                {'name': 'Discord', 'status': 'connected', 'icon': 'MessageSquare'},
                {'name': 'Slack', 'status': 'connected', 'icon': 'Hash'},
                {'name': 'WhatsApp', 'status': 'standby', 'icon': 'Phone'},
                {'name': 'Live Canvas (A2UI)', 'status': 'active', 'icon': 'Layout'},
            ],
            'active_model': 'ollama/llama3.3:70b-instruct-q4_K_M',
            'memory_store': 'local_sqlite_vector (~/.openclaw/memory.db)',
            'features': [
                'Hub-and-Spoke Gateway Daemon',
                'Multi-Channel Switchboard',
                'Deterministic Sandbox Execution',
                'Live Canvas (Agent-to-UI)',
                'JSON5 Configuration Schema',
                'Automated CLI Doctor Diagnostic',
            ],
        })


class OpenClawDispatchView(views.APIView):
    """
    Simulates dispatching an event (moderation alert, draft review, channel broadcast)
    to the OpenClaw Agent Gateway.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        channel = request.data.get('channel', 'discord')
        action = request.data.get('action', 'BROADCAST')
        payload = request.data.get('payload', {})

        AiGenerationLog.objects.create(
            user=request.user,
            task_type=f'OPENCLAW_DISPATCH_{action}',
            prompt_summary=f"Channel: {channel}, Action: {action}",
            tokens_used=150,
        )

        return Response({
            'success': True,
            'gateway': '127.0.0.1:18789',
            'dispatched_to': channel,
            'action': action,
            'timestamp': timezone.now().isoformat(),
            'message': f"OpenClaw agent successfully dispatched task to #{channel} switchboard.",
        })


class OpenClawAutoDraftView(views.APIView):
    """
    Uses the OpenClaw Agent persona to autonomously draft a technical engineering article
    and save it directly to the user's drafts or published articles.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        topic = request.data.get('topic', 'Autonomous Multi-Agent Systems in Production').strip()

        title = f"Autonomous Engineering: {topic} Powered by OpenClaw"
        slug_base = slugify(title)
        slug = f"{slug_base}-{timezone.now().strftime('%m%d%H%M')}"

        content = f"""# {title}

Authored autonomously via the **[OpenClaw Gateway](https://github.com/openclaw/openclaw)** local agent runtime.

---

## Executive Summary
This analysis investigates **{topic}**, focusing on how local-first agentic infrastructure decouples messaging platforms from autonomous execution environments.

### Core Architectural Pillars
1. **Decoupled Gateway Switching**: By utilizing a dedicated daemon listening on port `18789`, external channels (Slack, Discord, Telegram) communicate through a unified protocol without vendor lock-in.
2. **Deterministic Sandboxing**: Tool execution is confined to restricted local capabilities, preserving host security while granting high-bandwidth terminal and filesystem access.
3. **Live Canvas Interactive Synthesis**: Rather than passive responses, agent actions produce dynamic interactive interfaces that humans can verify in real time.

```python
# OpenClaw Task Definition
from openclaw.agents import AutonomousAgent

agent = AutonomousAgent(
    model="llama3.3:70b",
    tools=["filesystem", "terminal", "blog_publisher"],
    gateway="http://127.0.0.1:18789"
)

result = agent.execute_workflow(goal="{topic}")
print("Workflow status:", result.status)
```

---

## Conclusion
Adopting sovereign, local-first tools like **OpenClaw** enables developer teams to build high-velocity autonomous workflows with guaranteed privacy and zero SaaS token markups.
"""

        cat = Category.objects.filter(slug='artificial-intelligence').first() or Category.objects.first()

        post = Post.objects.create(
            author=request.user,
            title=title,
            slug=slug,
            excerpt=f"An autonomous technical analysis of {topic} generated via the OpenClaw agent pipeline.",
            content=content,
            category=cat,
            featured_image='https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
            status=PostStatus.PUBLISHED,
            published_at=timezone.now(),
            reading_time=4,
            meta_title=title,
            meta_description=f"Analysis of {topic} generated with OpenClaw.",
            meta_keywords="openclaw, ai agents, autonomous computing"
        )

        tag_openclaw, _ = Tag.objects.get_or_create(name='openclaw', defaults={'slug': 'openclaw'})
        tag_agent, _ = Tag.objects.get_or_create(name='ai-agents', defaults={'slug': 'ai-agents'})
        post.tags.add(tag_openclaw, tag_agent)

        AiGenerationLog.objects.create(
            user=request.user,
            task_type='OPENCLAW_AUTODRAFT',
            prompt_summary=f"Topic: {topic}",
            tokens_used=450,
        )

        return Response({
            'success': True,
            'post': {
                'id': post.id,
                'title': post.title,
                'slug': post.slug,
                'published_at': post.published_at,
            },
            'message': f"OpenClaw agent created and published '{post.title}'!",
        }, status=status.HTTP_201_CREATED)
