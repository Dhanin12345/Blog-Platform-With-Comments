import axios from 'axios'

const API_BASE_URL = ''

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to attach JWT Access Token
api.interceptors.request.use(
  (config) => {
    const tokens = JSON.parse(localStorage.getItem('blogsphere_tokens') || '{}')
    if (tokens?.access) {
      config.headers.Authorization = `Bearer ${tokens.access}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      const tokens = JSON.parse(localStorage.getItem('blogsphere_tokens') || '{}')
      if (tokens?.refresh) {
        try {
          const res = await axios.post('/api/auth/refresh/', { refresh: tokens.refresh })
          const newTokens = { ...tokens, access: res.data.access }
          if (res.data.refresh) newTokens.refresh = res.data.refresh
          localStorage.setItem('blogsphere_tokens', JSON.stringify(newTokens))
          originalRequest.headers.Authorization = `Bearer ${newTokens.access}`
          return api(originalRequest)
        } catch (refreshErr) {
          localStorage.removeItem('blogsphere_tokens')
          localStorage.removeItem('blogsphere_user')
          window.dispatchEvent(new Event('auth-logout'))
        }
      }
    }
    return Promise.reject(error)
  }
)

export const authApi = {
  register: (data) => api.post('/api/auth/register/', data),
  login: (credentials) => api.post('/api/auth/login/', credentials),
  demoLogin: (persona) => api.post('/api/auth/demo-login/', { persona }),
  getMe: () => api.get('/api/auth/me/'),
  updateProfile: (data) => api.patch('/api/auth/me/', data),
  changePassword: (data) => api.post('/api/auth/change-password/', data),
  getAuthors: () => api.get('/api/auth/authors/'),
  getAuthorProfile: (username) => api.get(`/api/auth/authors/${username}/`),
  toggleFollow: (userId) => api.post(`/api/auth/${userId}/follow/`),
  // Admin User Management
  listUsers: () => api.get('/api/auth/manage/'),
  updateUserRole: (id, data) => api.patch(`/api/auth/manage/${id}/`, data),
}

export const postsApi = {
  list: (params) => api.get('/api/posts/', { params }),
  get: (slug) => api.get(`/api/posts/${slug}/`),
  create: (data) => api.post('/api/posts/', data),
  update: (slug, data) => api.patch(`/api/posts/${slug}/`, data),
  delete: (slug) => api.delete(`/api/posts/${slug}/`),
  like: (slug) => api.post(`/api/posts/${slug}/like/`),
  bookmark: (slug) => api.post(`/api/posts/${slug}/bookmark/`),
  feed: (params) => api.get('/api/posts/feed/', { params }),
  trending: () => api.get('/api/posts/trending/'),
  myPosts: (params) => api.get('/api/posts/my_posts/', { params }),
  myBookmarks: (params) => api.get('/api/posts/my_bookmarks/', { params }),
}

export const categoriesApi = {
  list: () => api.get('/api/posts/categories/'),
  create: (data) => api.post('/api/posts/categories/', data),
}

export const tagsApi = {
  list: () => api.get('/api/posts/tags/'),
}

export const commentsApi = {
  list: (postSlug) => api.get(`/api/comments/post/${postSlug}/`),
  create: (postSlug, data) => api.post(`/api/comments/post/${postSlug}/`, data),
  update: (id, data) => api.patch(`/api/comments/${id}/`, data),
  delete: (id) => api.delete(`/api/comments/${id}/`),
  like: (id) => api.post(`/api/comments/${id}/like/`),
  pin: (id) => api.post(`/api/comments/${id}/pin/`),
}

export const moderationApi = {
  fileReport: (data) => api.post('/api/moderation/report/', data),
  listReports: () => api.get('/api/moderation/reports/'),
  resolveReport: (id, data) => api.post(`/api/moderation/reports/${id}/resolve/`, data),
  listAuditLogs: () => api.get('/api/moderation/audit-logs/'),
}

export const notificationsApi = {
  list: (unreadOnly = false) => api.get('/api/notifications/', { params: { unread_only: unreadOnly } }),
  getUnreadCount: () => api.get('/api/notifications/unread-count/'),
  markRead: (id) => api.post(`/api/notifications/${id}/read/`),
  markAllRead: () => api.post('/api/notifications/mark-all-read/'),
}

export const analyticsApi = {
  getAuthorStats: () => api.get('/api/analytics/author/'),
  getPlatformStats: () => api.get('/api/analytics/platform/'),
  recordView: (slug) => api.post(`/api/analytics/record-view/${slug}/`),
}

export const aiApi = {
  generateTitles: (data) => api.post('/api/ai/generate-title/', data),
  generateSummary: (data) => api.post('/api/ai/generate-summary/', data),
  suggestTags: (data) => api.post('/api/ai/suggest-tags/', data),
  classifyCategory: (data) => api.post('/api/ai/classify-category/', data),
  improveWriting: (data) => api.post('/api/ai/improve-writing/', data),
}

export const uploadApi = {
  uploadImage: (formData) => api.post('/api/upload/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
}

export default api
