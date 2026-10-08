import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  Clock,
  Heart,
  Bookmark,
  Share2,
  Flag,
  UserPlus,
  UserCheck,
  Edit,
  ArrowLeft,
  Eye,
  Calendar,
  Sparkles,
  MessageSquare
} from 'lucide-react'
import { postsApi, authApi, analyticsApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import CommentSection from '../components/CommentSection'
import ReportModal from '../components/ReportModal'
import MarkdownRenderer from '../components/MarkdownRenderer'

export default function BlogDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const { showToast } = useToast()

  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)
  const [followersCount, setFollowersCount] = useState(0)

  // Report Modal state
  const [isReportOpen, setIsReportOpen] = useState(false)

  useEffect(() => {
    setLoading(true)
    postsApi.get(slug)
      .then(res => {
        const p = res.data
        setPost(p)
        setIsLiked(p.is_liked || false)
        setLikesCount(p.likes_count || 0)
        setIsBookmarked(p.is_bookmarked || false)
        setIsFollowing(p.author?.is_following || false)
        setFollowersCount(p.author?.followers_count || 0)

        // Record view asynchronously
        analyticsApi.recordView(slug).catch(() => {})
      })
      .catch(err => {
        console.error(err)
        showToast('Article not found', 'error')
        navigate('/')
      })
      .finally(() => setLoading(false))
  }, [slug])

  const handleLike = async () => {
    if (!isAuthenticated) {
      showToast('Please login to like this article', 'info')
      return
    }
    try {
      const res = await postsApi.like(slug)
      setIsLiked(res.data.liked)
      setLikesCount(res.data.likes_count)
    } catch (err) {
      showToast('Error liking post', 'error')
    }
  }

  const handleBookmark = async () => {
    if (!isAuthenticated) {
      showToast('Please login to save this article', 'info')
      return
    }
    try {
      const res = await postsApi.bookmark(slug)
      setIsBookmarked(res.data.bookmarked)
      showToast(res.data.bookmarked ? 'Saved to bookmarks' : 'Removed from bookmarks', 'success')
    } catch (err) {
      showToast('Error saving bookmark', 'error')
    }
  }

  const handleToggleFollow = async () => {
    if (!isAuthenticated) {
      showToast('Please login to follow authors', 'info')
      return
    }
    try {
      const res = await authApi.toggleFollow(post.author.id)
      setIsFollowing(res.data.is_following)
      setFollowersCount(res.data.followers_count)
      showToast(res.data.message, 'success')
    } catch (err) {
      showToast('Failed to update follow status', 'error')
    }
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    showToast('Link copied to clipboard!', 'success')
  }

  if (loading) {
    return (
      <div className="container-narrow" style={{ padding: '4rem 1.5rem' }}>
        <div className="skeleton" style={{ height: '40px', width: '70%', marginBottom: '1.5rem' }} />
        <div className="skeleton" style={{ height: '24px', width: '40%', marginBottom: '2rem' }} />
        <div className="skeleton" style={{ height: '360px', marginBottom: '2rem', borderRadius: 'var(--radius-lg)' }} />
        <div className="skeleton" style={{ height: '140px' }} />
      </div>
    )
  }

  if (!post) return null

  const isAuthor = user && (user.id === post.author?.id || user.role === 'ADMIN')

  return (
    <article style={{ paddingBottom: '6rem' }}>
      {/* Top Header / Meta Bar */}
      <header style={{
        background: 'linear-gradient(180deg, rgba(99, 102, 241, 0.08) 0%, transparent 100%)',
        padding: '3rem 0 2rem 0',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <div className="container-narrow">
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            <ArrowLeft size={16} /> Back to all articles
          </Link>

          {/* Category & Reading Time */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            {post.category && (
              <span className="badge badge-primary">{post.category.name}</span>
            )}
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Clock size={14} /> {post.reading_time || 3} min read
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Eye size={14} /> {post.views_count} views
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Calendar size={14} /> {new Date(post.published_at || post.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          </div>

          {/* Title */}
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, lineHeight: 1.2, marginBottom: '1.5rem' }}>
            {post.title}
          </h1>

          {/* Author Card & Follow */}
          <div className="glass-panel" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 1.25rem',
            gap: '1rem',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <Link to={`/author/${post.author?.username}`}>
                <img
                  src={post.author?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${post.author?.username}`}
                  alt={post.author?.username}
                  style={{ width: '46px', height: '46px', borderRadius: '50%', objectFit: 'cover' }}
                />
              </Link>
              <div>
                <Link
                  to={`/author/${post.author?.username}`}
                  style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', textDecoration: 'none' }}
                >
                  {post.author?.first_name ? `${post.author.first_name} ${post.author.last_name}` : post.author?.username}
                </Link>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {post.author?.bio || 'Author at BlogSphere'} • {followersCount} followers
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              {isAuthor ? (
                <Link to={`/edit-post/${post.slug}`} className="btn btn-secondary btn-sm">
                  <Edit size={14} /> Edit Article
                </Link>
              ) : (
                <button
                  onClick={handleToggleFollow}
                  className={`btn btn-sm ${isFollowing ? 'btn-secondary' : 'btn-primary'}`}
                >
                  {isFollowing ? <><UserCheck size={14} /> Following</> : <><UserPlus size={14} /> Follow</>}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <div className="container-narrow" style={{ marginTop: '2.5rem' }}>
        
        {/* Featured Image */}
        {post.featured_image && (
          <div style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', maxHeight: '460px', marginBottom: '2.5rem', boxShadow: 'var(--shadow-md)' }}>
            <img
              src={post.featured_image}
              alt={post.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        )}

        {/* Article Content */}
        <div style={{ marginBottom: '3rem' }}>
          <MarkdownRenderer content={post.content} />
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Tags:</span>
            {post.tags.map((tag) => (
              <Link key={tag.id || tag.name} to={`/?tag=${tag.slug}`} className="tag-pill">
                #{tag.name}
              </Link>
            ))}
          </div>
        )}

        {/* Sticky Interaction Bar */}
        <div className="glass-panel-elevated" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.85rem 1.5rem',
          borderRadius: 'var(--radius-full)',
          position: 'sticky',
          bottom: '2rem',
          zIndex: 50,
          boxShadow: 'var(--shadow-lg)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <button
              onClick={handleLike}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'transparent',
                border: 'none',
                color: isLiked ? 'var(--accent-rose)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.9rem'
              }}
            >
              <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
              <span>{likesCount}</span>
            </button>

            <a
              href="#comments"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.9rem'
              }}
            >
              <MessageSquare size={19} />
              <span>{post.comments_count || 0}</span>
            </a>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={handleBookmark}
              className="btn btn-ghost btn-icon"
              title="Bookmark article"
              style={{ color: isBookmarked ? 'var(--accent-primary)' : 'inherit' }}
            >
              <Bookmark size={18} fill={isBookmarked ? 'currentColor' : 'none'} />
            </button>

            <button onClick={handleShare} className="btn btn-ghost btn-icon" title="Share article">
              <Share2 size={18} />
            </button>

            <button
              onClick={() => setIsReportOpen(true)}
              className="btn btn-ghost btn-icon"
              title="Report content"
              style={{ color: 'var(--accent-rose)' }}
            >
              <Flag size={18} />
            </button>
          </div>
        </div>

        {/* Nested Comments Section */}
        <CommentSection postSlug={post.slug} postAuthorId={post.author?.id} />

      </div>

      {/* Report Modal */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        targetType="POST"
        targetId={post.id}
        targetTitle={post.title}
      />
    </article>
  )
}
