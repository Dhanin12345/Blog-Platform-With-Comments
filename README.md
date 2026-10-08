# 🚀 BlogSphere — Advanced Full-Stack Blogging & Community Platform

**BlogSphere** is an advanced, production-grade engineering and community publishing ecosystem engineered with **Django 5 REST Framework**, **React 18 + Vite**, **JWT Authentication with RBAC**, **Nested Discussion Threads**, **Author Analytics Studio**, **Content Moderation Command Center**, and a **Modular AI Writing Assistant**.

---

## 🌟 Key Features

### 👤 1. User Authentication & Role-Based Authorization (RBAC)
- **Role Tiering**: `ADMIN`, `MODERATOR`, `AUTHOR`, `USER` (Reader).
- **Security**: Stateless HMAC-SHA256 JWT tokens via SimpleJWT with auto-refreshing Axios interceptors and PBKDF2 password hashing.
- **Profiles**: Public author profiles, bios, custom avatars, location, website, and follower counts.
- **⚡ 1-Click Demo Personas**: Instant switcher in the UI to evaluate the app as `Admin`, `Moderator`, `Sarah (Author)`, or `Emily (Reader)` without typing credentials.

### 📝 2. Advanced Blog & Content Lifecycle
- **Author Studio**: Create, edit, and delete rich technical posts.
- **Publishing Workflow**: `DRAFT`, `PUBLISHED`, `SCHEDULED` (with automated release date trigger), `ARCHIVED`, `DELETED`.
- **Taxonomy**: Hierarchical categories with parent/subcategories and multi-tag association.
- **SEO & Readership**: Dynamic reading time estimation, meta descriptions, and keywords.

### 💬 3. Advanced Comment & Discussion Tree
- **Nested Replies**: Infinite-depth discussion trees with visual indentation lines.
- **Author Pinning**: Authors and admins can pin high-signal comments to the top.
- **Community Reactions**: Like comments and real-time interaction counters.
- **Moderation Flagging**: Report abusive comments directly to moderators.

### ❤️ 4. Social Dynamics & "Your Feed"
- **Interactions**: One-click Post Likes and Bookmark saves.
- **Author Following**: Follow writers and get notified when they publish.
- **Personalized "Your Feed"**: Algorithmic stream prioritising articles by followed authors and trending topics.
- **Live Counters**: Automated view impression tracking with 15-minute IP deduplication.

### 🔍 5. Multi-Criteria Smart Search & Filtering
- Search across titles, markdown content, excerpts, author usernames, and tags.
- Instant sort filters: **Latest**, **Most Viewed**, **Most Liked**, **Trending**.
- Horizontal scrollable topic pills for category discovery.

### 🔔 6. Notification System
- Live notification badges with unread counters and dropdown drawer.
- Automatic alerts triggered by comment replies, likes, and author follows.
- 1-Click "Mark all as read".

### 📊 7. Author Analytics Studio
- Overview cards: Total Views, Likes, Comments, Followers, Bookmarks, and Posts.
- **Readership Velocity Chart**: 14-day interactive time-series SVG visualization.
- **Top Performing Articles Table**: Detailed breakdown of leading articles.
- Content lifecycle manager with draft / published filters.

### 🛡️ 8. Admin & Content Moderation Command Center
- **Moderation Queue**: Review user-flagged reports (Spam, Harassment, Hate Speech, etc.).
- **Enforcement Actions**: Remove content, suspend accounts, issue warnings, or dismiss.
- **User Role Management**: Search user directory, elevate/demote roles, activate/deactivate accounts.
- **Security Audit Trail**: Chronological event logs for administrative and moderation actions.

### 🤖 9. Modular AI Writing Assistant
- **AI Headline Generator**: Produces 5 high-impact viral and technical headlines.
- **Executive Summarizer**: Auto-generates concise excerpts for previews and SEO.
- **Tag Discovery**: Recommends trending tags based on body text semantics.
- **Content Classifier**: Automatically determines the category with confidence ratings.
- **Tone & Cadence Polish**: Enhances technical clarity, active voice, and grammar.
- *Zero-dependency offline heuristics engine with pluggable support for Gemini and OpenAI API keys.*

### 🎨 10. Next-Level UI/UX Design System
- **Rich Aesthetics**: Premium dark mode default with instant light mode toggle.
- **Glassmorphism**: Translucent frosted backdrops, subtle glow borders, and fluid hover elevations.
- **Typography**: Google Fonts (Plus Jakarta Sans, Inter, JetBrains Mono).
- **Responsive**: Fully optimized for mobile, tablet, and desktop screens.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, React Router DOM v6, Axios, Lucide React, Modern CSS Design System |
| **Backend** | Python 3.10+, Django 5.1, Django REST Framework 3.17, SimpleJWT, django-cors-headers, Pillow |
| **Database** | SQLite (Development / Demo seeded) / PostgreSQL (Production ready) |
| **Testing** | Pytest, Pytest-Django, API Client integration tests |
| **DevOps** | Docker, Docker Compose |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Python 3.10+**
- **Node.js 18+ & npm**

### 2. Backend Setup
```bash
cd backend

# Activate virtual environment
# Windows:
.\.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate

# Install dependencies (already prepared)
pip install -r requirements.txt

# Run migrations (already applied)
python manage.py migrate

# Start backend server
python manage.py runserver 127.0.0.1:8000
```

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies (already cached)
npm install

# Start Vite dev server
npm run dev
```

Visit **`http://localhost:5173`** in your browser!

---

## 🔑 Demo Personas & Credentials

All seeded accounts have the password: **`Password123!`**  
*(You can also use the 1-Click Persona button in the navbar or login screen)*

| Persona | Username | Role | Primary Features to Test |
|---|---|---|---|
| **System Admin** | `admin` | `ADMIN` | Admin dashboard, user role editing, moderation actions, post deletion |
| **Moderator** | `moderator` | `MODERATOR` | Reviewing reports, warning users, resolving flags, audit logs |
| **Lead Author** | `sarah_dev` | `AUTHOR` | Author Studio, AI Writing Assistant, Analytics Studio, pinning comments |
| **AI Author** | `alex_ai` | `AUTHOR` | Writing articles, viewing analytics |
| **Reader** | `emily_r` | `USER` | Reading articles, liking, bookmarking, nested comment replies, reporting |

---

## 🧪 Running Automated Tests

Run backend tests using Pytest:
```bash
cd backend
pytest
```
*Current test suite: **6 / 6 passed (100% pass rate)*** covering user registration, demo login, post CRUD, nested comment trees, and AI writing assistants.

---

## 🐳 Docker Deployment

To launch the complete containerized stack:
```bash
docker-compose up --build
```
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000/api`
- Django Admin: `http://localhost:8000/admin`

<img width="786" height="485" alt="image" src="https://github.com/user-attachments/assets/a6c3fe67-1735-48fe-8945-8fd52e079605" />

