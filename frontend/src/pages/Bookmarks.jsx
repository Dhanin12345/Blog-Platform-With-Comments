import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Bookmark, Compass } from 'lucide-react'
import { postsApi } from '../services/api'
import BlogCard from '../components/BlogCard'
import { useAuth } from '../context/AuthContext'

export default function Bookmarks() {
  const { isAuthenticated } = useAuth()
  const [bookmarks, setBookmarks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isAuthenticated) {
      postsApi.myBookmarks()
        .then(res => setBookmarks(res.data.results || res.data))
        .catch(err => console.error(err))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [isAuthenticated])

  const handleBookmarkChange = (postId, isBookmarked) => {
    if (!isBookmarked) {
      setBookmarks(prev => prev.filter(p => p.id !== postId))
    }
  }

  return (
    <div className="container" style={{ padding: '3rem 1.5rem 6rem 1.5rem' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
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
            <Bookmark size={20} />
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Saved Bookmarks</h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Articles saved for your technical reading queue and reference library.
        </p>
      </div>

      {!isAuthenticated ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <h3>Please log in to view your saved bookmarks</h3>
          <Link to="/login" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Log In
          </Link>
        </div>
      ) : loading ? (
        <div className="grid-cards">
          {[1, 2, 3].map(n => <div key={n} className="skeleton" style={{ height: '360px', borderRadius: 'var(--radius-lg)' }} />)}
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
          <Compass size={48} style={{ margin: '0 auto 1rem auto', opacity: 0.5 }} />
          <h3>No bookmarks saved yet</h3>
          <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
            Click the bookmark icon on any blog card or article page to save it for later.
          </p>
          <Link to="/" className="btn btn-primary btn-sm" style={{ marginTop: '1.25rem' }}>
            Browse Articles
          </Link>
        </div>
      ) : (
        <div className="grid-cards">
          {bookmarks.map(post => (
            <BlogCard key={post.id} post={post} onBookmarkChange={handleBookmarkChange} />
          ))}
        </div>
      )}
    </div>
  )
}
