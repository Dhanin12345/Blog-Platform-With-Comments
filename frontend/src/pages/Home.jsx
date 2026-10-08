import React, { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Sparkles,
  TrendingUp,
  Clock,
  ThumbsUp,
  MessageCircle,
  Eye,
  Filter,
  ArrowRight,
  Zap,
  Users,
  Compass,
  X,
  Flame
} from 'lucide-react'
import { postsApi, categoriesApi, authApi } from '../services/api'
import BlogCard from '../components/BlogCard'
import { useAuth } from '../context/AuthContext'

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { isAuthenticated } = useAuth()

  const [posts, setPosts] = useState([])
  const [featuredPost, setFeaturedPost] = useState(null)
  const [categories, setCategories] = useState([])
  const [trendingPosts, setTrendingPosts] = useState([])
  const [topAuthors, setTopAuthors] = useState([])
  const [loading, setLoading] = useState(true)

  const activeCategory = searchParams.get('category') || ''
  const activeTag = searchParams.get('tag') || ''
  const activeSort = searchParams.get('sort') || 'latest'
  const searchQuery = searchParams.get('q') || ''

  useEffect(() => {
    // Fetch categories and top authors
    categoriesApi.list().then(res => setCategories(res.data.results || res.data)).catch(() => {})
    postsApi.trending().then(res => setTrendingPosts((res.data.results || res.data).slice(0, 5))).catch(() => {})
    authApi.getAuthors().then(res => setTopAuthors((res.data.results || res.data).slice(0, 4))).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = {
      sort: activeSort,
    }
    if (activeCategory) params.category = activeCategory
    if (activeTag) params.tag = activeTag
    if (searchQuery) params.q = searchQuery

    postsApi.list(params)
      .then(res => {
        const results = res.data.results || res.data
        if (results.length > 0 && !activeCategory && !searchQuery && !activeTag && activeSort === 'latest') {
          setFeaturedPost(results[0])
          setPosts(results.slice(1))
        } else {
          setFeaturedPost(null)
          setPosts(results)
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [activeCategory, activeTag, activeSort, searchQuery])

  const handleSortChange = (newSort) => {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('sort', newSort)
    setSearchParams(nextParams)
  }

  const handleCategoryClick = (slug) => {
    const nextParams = new URLSearchParams(searchParams)
    if (activeCategory === slug) {
      nextParams.delete('category')
    } else {
      nextParams.set('category', slug)
    }
    setSearchParams(nextParams)
  }

  const clearFilter = (param) => {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete(param)
    setSearchParams(nextParams)
  }

  return (
    <div style={{ paddingBottom: '5rem' }}>
      
      {/* Hero Section (shown when no specific search is active) */}
      {!searchQuery && !activeCategory && !activeTag && (
        <section style={{
          position: 'relative',
          padding: '5rem 0 3.5rem 0',
          overflow: 'hidden',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'linear-gradient(180deg, rgba(99, 102, 241, 0.05) 0%, transparent 100%)'
        }}>
          <div className="container" style={{ textAlign: 'center', maxWidth: '820px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.4rem 1rem',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(99, 102, 241, 0.12)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              color: '#818cf8',
              fontSize: '0.85rem',
              fontWeight: 600,
              marginBottom: '1.5rem',
              boxShadow: 'var(--shadow-glow)'
            }}>
              <Zap size={14} /> Next-Gen Technical Community Platform
            </div>

            <h1 style={{ fontSize: 'clamp(2.4rem, 5vw, 3.8rem)', fontWeight: 800, lineHeight: 1.15, marginBottom: '1.25rem' }}>
              Where Modern Engineering & Ideas <span className="gradient-text">Take Flight</span>
            </h1>

            <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '2rem' }}>
              Discover in-depth architectural patterns, agentic AI breakthroughs, and full-stack perspectives. Interactive discussions with real-time nested comments.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <button onClick={() => handleSortChange('trending')} className="btn btn-gradient btn-lg">
                <Flame size={18} /> Explore Trending
              </button>
              {isAuthenticated ? (
                <Link to="/create-post" className="btn btn-secondary btn-lg">
                  <Sparkles size={18} /> Author Studio
                </Link>
              ) : (
                <Link to="/register" className="btn btn-secondary btn-lg">
                  Join the Community <ArrowRight size={16} />
                </Link>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Categories Horizontal Pills Bar */}
      <section style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)', padding: '1rem 0' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', overflowX: 'auto', paddingBottom: '4px' }}>
          <button
            onClick={() => { const p = new URLSearchParams(searchParams); p.delete('category'); setSearchParams(p); }}
            className={`btn btn-sm ${!activeCategory ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: 'var(--radius-full)' }}
          >
            All Topics
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.slug)}
              className={`btn btn-sm ${activeCategory === cat.slug ? 'btn-primary' : 'btn-secondary'}`}
              style={{ borderRadius: 'var(--radius-full)', whiteSpace: 'nowrap' }}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </section>

      {/* Main Content Area */}
      <div className="container" style={{ marginTop: '2.5rem' }}>
        
        {/* Active Filters Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          {/* Left tags / search status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>
              {searchQuery ? `Search Results for "${searchQuery}"` : activeCategory ? `Category: ${activeCategory}` : activeTag ? `Tag: #${activeTag}` : 'Latest Feed'}
            </h2>

            {searchQuery && (
              <span className="badge badge-primary" style={{ cursor: 'pointer' }} onClick={() => clearFilter('q')}>
                "{searchQuery}" <X size={12} />
              </span>
            )}
            {activeCategory && (
              <span className="badge badge-primary" style={{ cursor: 'pointer' }} onClick={() => clearFilter('category')}>
                {activeCategory} <X size={12} />
              </span>
            )}
            {activeTag && (
              <span className="badge badge-cyan" style={{ cursor: 'pointer' }} onClick={() => clearFilter('tag')}>
                #{activeTag} <X size={12} />
              </span>
            )}
          </div>

          {/* Right Sort Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--bg-surface)', padding: '0.3rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <button
              onClick={() => handleSortChange('latest')}
              className={`btn btn-sm ${activeSort === 'latest' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
            >
              <Clock size={13} /> Latest
            </button>
            <button
              onClick={() => handleSortChange('trending')}
              className={`btn btn-sm ${activeSort === 'trending' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
            >
              <TrendingUp size={13} /> Trending
            </button>
            <button
              onClick={() => handleSortChange('most_viewed')}
              className={`btn btn-sm ${activeSort === 'most_viewed' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
            >
              <Eye size={13} /> Viewed
            </button>
            <button
              onClick={() => handleSortChange('most_liked')}
              className={`btn btn-sm ${activeSort === 'most_liked' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
            >
              <ThumbsUp size={13} /> Liked
            </button>
          </div>
        </div>

        {/* Featured Post Card (Hero Spotlight) */}
        {featuredPost && (
          <div className="glass-panel" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            overflow: 'hidden',
            marginBottom: '3rem',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            boxShadow: 'var(--shadow-glow)'
          }}>
            <div style={{ height: '340px', position: 'relative' }}>
              <img
                src={featuredPost.featured_image || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80'}
                alt={featuredPost.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <span className="badge badge-primary" style={{ position: 'absolute', top: '16px', left: '16px', backdropFilter: 'blur(10px)', background: 'rgba(15, 23, 42, 0.8)' }}>
                ⭐ Featured Article
              </span>
            </div>
            <div style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <span className="badge badge-cyan">{featuredPost.category?.name || 'Engineering'}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{featuredPost.reading_time || 4} min read</span>
              </div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1rem', lineHeight: 1.25 }}>
                <Link to={`/post/${featuredPost.slug}`} style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>
                  {featuredPost.title}
                </Link>
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                {featuredPost.excerpt}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <img
                    src={featuredPost.author?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${featuredPost.author?.username}`}
                    alt={featuredPost.author?.username}
                    style={{ width: '36px', height: '36px', borderRadius: '50%' }}
                  />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{featuredPost.author?.username}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Lead Engineer</div>
                  </div>
                </div>
                <Link to={`/post/${featuredPost.slug}`} className="btn btn-primary btn-sm">
                  Read Article <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* 2-Column Grid: Articles + Sidebar */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2.5rem' }}>
          
          {/* Left Column: Articles Grid */}
          <div>
            {loading ? (
              <div className="grid-cards">
                {[1, 2, 3, 4].map(n => (
                  <div key={n} className="skeleton" style={{ height: '360px', borderRadius: 'var(--radius-lg)' }} />
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
                <Compass size={48} style={{ margin: '0 auto 1rem auto', opacity: 0.5 }} />
                <h3>No articles found</h3>
                <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                  Try relaxing your search terms or selecting another category filter.
                </p>
              </div>
            ) : (
              <div className="grid-cards">
                {posts.map(post => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Trending Posts & Popular Authors Sidebar */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Trending Articles Widget */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <TrendingUp size={18} style={{ color: 'var(--accent-primary)' }} />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Trending Today</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {trendingPosts.map((tp, idx) => (
                  <Link
                    key={tp.id}
                    to={`/post/${tp.slug}`}
                    style={{ textDecoration: 'none', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}
                  >
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-muted)', lineHeight: 1 }}>
                      0{idx + 1}
                    </span>
                    <div>
                      <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4, marginBottom: '0.25rem' }}>
                        {tp.title}
                      </h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {tp.views_count} views • {tp.likes_count} likes
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Popular Authors Widget */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <Users size={18} style={{ color: 'var(--accent-cyan)' }} />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Top Authors</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {topAuthors.map(author => (
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
                      View
                    </Link>
                  </div>
                ))}
              </div>
            </div>

          </aside>

        </div>

      </div>

    </div>
  )
}
