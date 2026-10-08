# BlogSphere RESTful API Documentation

Base URL: `http://localhost:8000/api` (or `/api` via Vite frontend proxy)

---

## 1. Authentication & Users (`/api/auth/`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register/` | Register new user with username, email, password, role | No |
| `POST` | `/api/auth/login/` | Obtain JWT access and refresh token pair | No |
| `POST` | `/api/auth/refresh/` | Refresh JWT access token | No |
| `POST` | `/api/auth/demo-login/` | 1-click test persona sign-in (`admin`, `moderator`, `sarah_dev`, `emily_r`) | No |
| `GET` | `/api/auth/me/` | Fetch authenticated user profile & follower metrics | Yes |
| `PATCH`| `/api/auth/me/` | Update bio, avatar, location, website | Yes |
| `POST` | `/api/auth/change-password/` | Change account password | Yes |
| `GET` | `/api/auth/authors/` | List top authors with follower counts | No |
| `GET` | `/api/auth/authors/:username/` | Get author public profile and articles | No |
| `POST` | `/api/auth/:user_id/follow/` | Toggle follow / unfollow author | Yes |
| `GET` | `/api/auth/manage/` | List all users with roles (Admin only) | Admin |
| `PATCH`| `/api/auth/manage/:id/` | Update user role or active/suspended status | Admin |

---

## 2. Posts & Content Management (`/api/posts/`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/posts/` | List published posts with pagination, filters (`category`, `tag`, `author`, `q`, `sort`) | No |
| `GET` | `/api/posts/:slug/` | Get full post details with author info and interaction flags | No |
| `POST` | `/api/posts/` | Create post (Draft, Published, Scheduled) | Yes (Author/Admin) |
| `PATCH`| `/api/posts/:slug/` | Update post content, tags, category, SEO meta | Yes (Author/Admin) |
| `DELETE`| `/api/posts/:slug/` | Delete post | Yes (Author/Admin) |
| `POST` | `/api/posts/:slug/like/` | Toggle like / unlike post | Yes |
| `POST` | `/api/posts/:slug/bookmark/` | Toggle bookmark / unbookmark post | Yes |
| `GET` | `/api/posts/feed/` | Personalized "Your Feed" based on followed authors | Optional |
| `GET` | `/api/posts/trending/` | Get top trending articles | No |
| `GET` | `/api/posts/my_posts/` | List current author's posts (includes drafts & scheduled) | Yes |
| `GET` | `/api/posts/my_bookmarks/` | List current user's saved bookmarks | Yes |
| `GET` | `/api/posts/categories/` | List categories with subcategories and post counts | No |
| `GET` | `/api/posts/tags/` | List tags with post usage counts | No |

---

## 3. Comments & Nested Discussions (`/api/comments/`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/comments/post/:slug/` | Get nested comment tree for article | No |
| `POST` | `/api/comments/post/:slug/` | Add top-level comment or reply (`parent` id) | Yes |
| `PATCH`| `/api/comments/:id/` | Edit comment text | Yes (Owner) |
| `DELETE`| `/api/comments/:id/` | Delete comment | Yes (Owner/Mod/Admin) |
| `POST` | `/api/comments/:id/like/` | Toggle comment like | Yes |
| `POST` | `/api/comments/:id/pin/` | Toggle pinned comment | Yes (Author/Admin) |

---

## 4. Moderation & Trust & Safety (`/api/moderation/`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/moderation/report/` | File report against post, comment, or user | Yes |
| `GET` | `/api/moderation/reports/` | List moderation reports | Moderator/Admin |
| `POST` | `/api/moderation/reports/:id/resolve/` | Resolve report (`REMOVE_CONTENT`, `WARN_USER`, `SUSPEND_USER`, `DISMISS`) | Moderator/Admin |
| `GET` | `/api/moderation/audit-logs/` | List system security audit log | Moderator/Admin |

---

## 5. Notifications (`/api/notifications/`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/notifications/` | List user notifications (supports `?unread_only=true`) | Yes |
| `GET` | `/api/notifications/unread-count/` | Live badge counter | Yes |
| `POST` | `/api/notifications/:id/read/` | Mark single notification as read | Yes |
| `POST` | `/api/notifications/mark-all-read/` | Mark all notifications as read | Yes |

---

## 6. Analytics (`/api/analytics/`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/analytics/author/` | Author metrics totals + 14-day timeseries + top posts | Yes |
| `GET` | `/api/analytics/platform/` | Platform totals (Users, Posts, Comments, Reports) | Admin/Mod |
| `POST` | `/api/analytics/record-view/:slug/` | Track post view impression with deduplication | No |

---

## 7. AI Writing Assistant (`/api/ai/`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/ai/generate-title/` | Suggest 5 high-impact blog headlines | Yes |
| `POST` | `/api/ai/suggest-tags/` | Recommend relevant discovery tags | Yes |
| `POST` | `/api/ai/generate-summary/` | Synthesize executive summary & excerpt | Yes |
| `POST` | `/api/ai/classify-category/` | Classify content category with confidence score | Yes |
| `POST` | `/api/ai/improve-writing/` | Refine tone, grammar, and active voice | Yes |

---

## 8. Media Upload (`/api/upload/`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/upload/` | Secure multipart image upload (max 5MB, JPG/PNG/WebP) | Yes |
