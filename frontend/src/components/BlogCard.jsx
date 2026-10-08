import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, MessageSquare, Bookmark, Eye, Clock, Share2 } from 'lucide-react'
import { postsApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function BlogCard({ post, onLikeChange, onBookmarkChange }) {
  const { isAuthenticated } = useAuth()
  const { showToast } = useToast()

  const [isLiked, setIsLiked] = useState(post.is_liked || false)
  const [likesCount, setLikesCount] = useState(post.likes_count || 0)
  const [isBookmarked, setIsBookmarked] = useState(post.is_bookmarked || false)
  const [bookmarksCount, setBookmarksCount] = useState(post.bookmarks_count || 0)

  const handleLike = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isAuthenticated) {
      showToast('Please login to like posts', 'info')
      return
    }

    try {
      const res = await postsApi.like(post.slug)
      setIsLiked(res.data.liked)
      setLikesCount(res.data.likes_count)
      if (onLikeChange) onLikeChange(post.id, res.data.liked, res.data.likes_count)
    } catch (err) {
      showToast('Failed to like post', 'error')
    }
  }

  const handleBookmark = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isAuthenticated) {
      showToast('Please login to bookmark posts', 'info')
      return
    }

    try {
      const res = await postsApi.bookmark(post.slug)
      setIsBookmarked(res.data.bookmarked)
      setBookmarksCount(res.data.bookmarks_count)
      showToast(res.data.bookmarked ? 'Saved to bookmarks' : 'Removed from bookmarks', 'success')
      if (onBookmarkChange) onBookmarkChange(post.id, res.data.bookmarked)
    } catch (err) {
      showToast('Failed to bookmark post', 'error')
    }
  }

  const handleShare = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const url = `${window.location.origin}/post/${post.slug}`
    navigator.clipboard.writeText(url)
    showToast('Link copied to clipboard!', 'success')
  }

  const defaultThumbnails = [
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=800&q=80',
  ]
  const imageSrc = post.featured_image || defaultThumbnails[post.id % defaultThumbnails.length]

  return (
    <article className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Featured Thumbnail */}
      <Link to={`/post/${post.slug}`} style={{ position: 'relative', overflow: 'hidden', height: '210px', display: 'block' }}>
        <img
          src={imageSrc}
          alt={post.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
          onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.04)')}
          onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        />
        {/* Category Pill Over Image */}
        {post.category && (
          <span
            className="badge badge-primary"
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              backdropFilter: 'blur(10px)',
              background: 'rgba(15, 23, 42, 0.75)',
            }}
          >
            {post.category.name}
          </span>
        )}
        <span
          className="badge"
          style={{
            position: 'absolute',
            bottom: '12px',
            right: '12px',
            background: 'rgba(15, 23, 42, 0.8)',
            color: '#cbd5e1',
            backdropFilter: 'blur(8px)',
          }}
        >
          <Clock size={12} /> {post.reading_time || 3} min read
        </span>
      </Link>

      {/* Card Content Body */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1, gap: '0.75rem' }}>
        
        {/* Author metadata */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <Link to={`/author/${post.author?.username}`}>
            <img
              src={post.author?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${post.author?.username}`}
              alt={post.author?.username}
              style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
            />
          </Link>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
            <Link
              to={`/author/${post.author?.username}`}
              style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', textDecoration: 'none' }}
            >
              {post.author?.first_name ? `${post.author.first_name} ${post.author.last_name}` : post.author?.username}
            </Link>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {new Date(post.published_at || post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0.25rem 0' }}>
          <Link to={`/post/${post.slug}`} style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>
            {post.title}
          </Link>
        </h3>

        {/* Excerpt */}
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, flex: 1 }}>
          {post.excerpt || post.content?.substring(0, 140) + '...'}
        </p>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
            {post.tags.slice(0, 3).map((tag) => (
              <Link key={tag.id || tag.name} to={`/?tag=${tag.slug}`} className="tag-pill" style={{ fontSize: '0.725rem' }}>
                #{tag.name}
              </Link>
            ))}
          </div>
        )}

        {/* Action & Stats Footer */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '0.75rem',
          marginTop: 'auto',
          color: 'var(--text-muted)',
          fontSize: '0.8rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Likes */}
            <button
              onClick={handleLike}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                background: 'transparent',
                border: 'none',
                color: isLiked ? 'var(--accent-rose)' : 'inherit',
                cursor: 'pointer',
                fontSize: 'inherit'
              }}
            >
              <Heart size={15} fill={isLiked ? 'currentColor' : 'none'} />
              <span>{likesCount}</span>
            </button>

            {/* Comments */}
            <Link
              to={`/post/${post.slug}#comments`}
              style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'inherit', textDecoration: 'none' }}
            >
              <MessageSquare size={15} />
              <span>{post.comments_count || 0}</span>
            </Link>

            {/* Views */}
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Eye size={15} />
              <span>{post.views_count || 0}</span>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {/* Bookmark */}
            <button
              onClick={handleBookmark}
              style={{
                background: 'transparent',
                border: 'none',
                color: isBookmarked ? 'var(--accent-primary)' : 'inherit',
                cursor: 'pointer'
              }}
              title="Bookmark post"
            >
              <Bookmark size={15} fill={isBookmarked ? 'currentColor' : 'none'} />
            </button>

            {/* Share */}
            <button
              onClick={handleShare}
              style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer' }}
              title="Share article"
            >
              <Share2 size={15} />
            </button>
          </div>

        </div>

      </div>
    </article>
  )
}
