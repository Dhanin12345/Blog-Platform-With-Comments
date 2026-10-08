import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Rss, Users, Compass, ArrowRight } from 'lucide-react'
import { postsApi, authApi } from '../services/api'
import BlogCard from '../components/BlogCard'
import { useAuth } from '../context/AuthContext'

export default function Feed() {
  const { isAuthenticated, user } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [suggestedAuthors, setSuggestedAuthors] = useState([])

  useEffect(() => {
    postsApi.feed()
      .then(res => setPosts(res.data.results || res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))

    authApi.getAuthors()
      .then(res => setSuggestedAuthors((res.data.results || res.data).slice(0, 5)))
      .catch(() => {})
  }, [])

  return (
    <div className="container" style={{ padding: '3rem 1.5rem 5rem 1.5rem' }}>
      {/* Header */}
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
            <Rss size={20} />
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Your Personalized Feed</h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
          Articles curated from authors you follow and trending topics in your engineering network.
        </p>
      </div>

      {!isAuthenticated && (
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', border: '1px solid rgba(99, 102, 241, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Want a truly tailored feed?</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Log in or sign up to follow authors and tune your personal feed algorithm.</p>
          </div>
          <Link to="/login" className="btn btn-primary btn-sm">Log In Now</Link>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2.5rem' }}>
        <div>
          {loading ? (
            <div className="grid-cards">
              {[1, 2, 3].map(n => <div key={n} className="skeleton" style={{ height: '360px', borderRadius: 'var(--radius-lg)' }} />)}
            </div>
          ) : posts.length === 0 ? (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
              <Compass size={48} style={{ margin: '0 auto 1rem auto', opacity: 0.5 }} />
              <h3>Your feed is currently quiet</h3>
              <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                Follow top authors on the right to start seeing their newest articles here.
              </p>
            </div>
          ) : (
            <div className="grid-cards">
              {posts.map(post => <BlogCard key={post.id} post={post} />)}
            </div>
          )}
        </div>

        {/* Suggested Authors */}
        <aside>
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <Users size={18} style={{ color: 'var(--accent-primary)' }} />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Discover Writers</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {suggestedAuthors.map(author => (
                <div key={author.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Link
                    to={`/author/${author.username}`}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none' }}
                  >
                    <img
                      src={author.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${author.username}`}
                      alt={author.username}
                      style={{ width: '36px', height: '36px', borderRadius: '50%' }}
                    />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {author.first_name ? `${author.first_name} ${author.last_name}` : author.username}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {author.followers_count} followers
                      </div>
                    </div>
                  </Link>
                  <Link to={`/author/${author.username}`} className="btn btn-secondary btn-sm" style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}>
                    Profile
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
