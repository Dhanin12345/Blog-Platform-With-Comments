import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart3,
  Eye,
  Heart,
  MessageSquare,
  Users,
  Bookmark,
  FileText,
  TrendingUp,
  Edit,
  Trash2,
  ExternalLink,
  PlusCircle,
  Calendar
} from 'lucide-react'
import { analyticsApi, postsApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function AuthorDashboard() {
  const { user } = useAuth()
  const { showToast } = useToast()

  const [analytics, setAnalytics] = useState(null)
  const [myPosts, setMyPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('ALL')

  const fetchDashboardData = async () => {
    try {
      const [statsRes, postsRes] = await Promise.all([
        analyticsApi.getAuthorStats(),
        postsApi.myPosts(),
      ])
      setAnalytics(statsRes.data)
      setMyPosts(postsRes.data.results || postsRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const handleDeletePost = async (slug) => {
    if (!window.confirm('Are you sure you want to delete this article?')) return
    try {
      await postsApi.delete(slug)
      showToast('Article deleted', 'success')
      fetchDashboardData()
    } catch (err) {
      showToast('Failed to delete article', 'error')
    }
  }

  const filteredPosts = statusFilter === 'ALL'
    ? myPosts
    : myPosts.filter(p => p.status === statusFilter)

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem' }}>
        <div className="skeleton" style={{ height: '120px', marginBottom: '2rem' }} />
        <div className="skeleton" style={{ height: '300px', marginBottom: '2rem' }} />
      </div>
    )
  }

  const overview = analytics?.overview || {
    total_posts: 0,
    total_views: 0,
    total_likes: 0,
    total_comments: 0,
    total_followers: 0,
    total_bookmarks: 0,
  }

  const timeSeries = analytics?.time_series || []
  const maxViews = Math.max(...timeSeries.map(d => d.views), 10)

  return (
    <div className="container" style={{ padding: '3rem 1.5rem 6rem 1.5rem' }}>
      
      {/* Dashboard Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.4rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--accent-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff'
            }}>
              <BarChart3 size={20} />
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Author Analytics Studio</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Real-time performance metrics, readership engagement, and content lifecycle management.
          </p>
        </div>

        <Link to="/create-post" className="btn btn-gradient">
          <PlusCircle size={16} /> Write New Article
        </Link>
      </div>

      {/* 6 Key Metrics Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2.5rem'
      }}>
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Total Views</span>
            <Eye size={18} style={{ color: 'var(--accent-cyan)' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{overview.total_views.toLocaleString()}</div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Total Likes</span>
            <Heart size={18} style={{ color: 'var(--accent-rose)' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{overview.total_likes.toLocaleString()}</div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Comments</span>
            <MessageSquare size={18} style={{ color: 'var(--accent-primary)' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{overview.total_comments.toLocaleString()}</div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Followers</span>
            <Users size={18} style={{ color: 'var(--accent-emerald)' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{overview.total_followers.toLocaleString()}</div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Bookmarks</span>
            <Bookmark size={18} style={{ color: 'var(--accent-amber)' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{overview.total_bookmarks.toLocaleString()}</div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Published Posts</span>
            <FileText size={18} style={{ color: 'var(--accent-primary)' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{overview.total_posts.toLocaleString()}</div>
        </div>
      </div>

      {/* Interactive Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        
        {/* SVG Views Over Time Chart */}
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Readership Velocity</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Daily view impressions over past 14 days</p>
            </div>
            <TrendingUp size={18} style={{ color: 'var(--accent-cyan)' }} />
          </div>

          <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '8px', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
            {timeSeries.map((item, idx) => {
              const heightPct = Math.min(100, Math.max(12, Math.round((item.views / maxViews) * 100)))
              return (
                <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                  <div
                    title={`${item.date}: ${item.views} views`}
                    style={{
                      width: '100%',
                      height: `${heightPct}%`,
                      background: 'linear-gradient(180deg, #6366f1 0%, #3b82f6 100%)',
                      borderRadius: '4px 4px 0 0',
                      transition: 'height 0.4s ease',
                      cursor: 'pointer'
                    }}
                  />
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '6px', whiteSpace: 'nowrap' }}>
                    {idx % 2 === 0 ? item.date.split(' ')[1] : ''}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Popular Posts Summary */}
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.4rem' }}>Top Performing Articles</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>Leading traffic drivers</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {analytics?.popular_posts?.map((p) => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <Link to={`/post/${p.slug}`} style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', textDecoration: 'none', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {p.title}
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span><Eye size={12} style={{ display: 'inline', marginRight: '2px' }} />{p.views_count}</span>
                  <span><Heart size={12} style={{ display: 'inline', marginRight: '2px' }} />{p.likes_count}</span>
                  <span><MessageSquare size={12} style={{ display: 'inline', marginRight: '2px' }} />{p.comments_count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Article Management Table */}
      <div className="glass-panel" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Published & Draft Articles</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Manage statuses, edits, and schedule triggers</p>
          </div>

          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {['ALL', 'PUBLISHED', 'DRAFT', 'SCHEDULED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-ghost'}`}
                style={{ fontSize: '0.75rem' }}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '0.75rem' }}>Title</th>
                <th style={{ padding: '0.75rem' }}>Status</th>
                <th style={{ padding: '0.75rem' }}>Views</th>
                <th style={{ padding: '0.75rem' }}>Likes</th>
                <th style={{ padding: '0.75rem' }}>Date</th>
                <th style={{ padding: '0.75rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPosts.map((post) => (
                <tr key={post.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.85rem 0.75rem', fontWeight: 600 }}>
                    <Link to={`/post/${post.slug}`} style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>
                      {post.title}
                    </Link>
                  </td>
                  <td style={{ padding: '0.85rem 0.75rem' }}>
                    <span className={`badge ${
                      post.status === 'PUBLISHED' ? 'badge-emerald' :
                      post.status === 'SCHEDULED' ? 'badge-cyan' :
                      post.status === 'DRAFT' ? 'badge-amber' : 'badge-primary'
                    }`}>
                      {post.status}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem 0.75rem', color: 'var(--text-secondary)' }}>{post.views_count}</td>
                  <td style={{ padding: '0.85rem 0.75rem', color: 'var(--text-secondary)' }}>{post.likes_count}</td>
                  <td style={{ padding: '0.85rem 0.75rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {new Date(post.published_at || post.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '0.85rem 0.75rem', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                      <Link to={`/edit-post/${post.slug}`} className="btn btn-ghost btn-icon" title="Edit">
                        <Edit size={14} />
                      </Link>
                      <button onClick={() => handleDeletePost(post.slug)} className="btn btn-ghost btn-icon" title="Delete" style={{ color: 'var(--accent-rose)' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
