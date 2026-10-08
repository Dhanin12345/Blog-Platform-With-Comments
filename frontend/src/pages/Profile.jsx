import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  User as UserIcon,
  MapPin,
  Globe,
  Calendar,
  Users,
  FileText,
  Bookmark,
  UserCheck,
  UserPlus,
  Edit3,
  X
} from 'lucide-react'
import { authApi, postsApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import BlogCard from '../components/BlogCard'

export default function Profile() {
  const { username } = useParams()
  const { user: currentUser, isAuthenticated, updateProfile } = useAuth()
  const { showToast } = useToast()

  const targetUsername = username || currentUser?.username

  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [bookmarks, setBookmarks] = useState([])
  const [activeTab, setActiveTab] = useState('articles') // 'articles', 'bookmarks'
  const [loading, setLoading] = useState(true)

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    bio: '',
    avatar: '',
    website: '',
    location: '',
  })

  useEffect(() => {
    if (!targetUsername) return

    setLoading(true)
    authApi.getAuthorProfile(targetUsername)
      .then(res => {
        setProfile(res.data)
        setEditForm({
          first_name: res.data.first_name || '',
          last_name: res.data.last_name || '',
          bio: res.data.bio || '',
          avatar: res.data.avatar || '',
          website: res.data.website || '',
          location: res.data.location || '',
        })

        // Fetch author's posts
        return postsApi.list({ author: targetUsername })
      })
      .then(res => {
        setPosts(res.data.results || res.data)
      })
      .catch(err => {
        console.error(err)
        showToast('Profile not found', 'error')
      })
      .finally(() => setLoading(false))

    // If own profile, fetch bookmarks
    if (currentUser?.username === targetUsername) {
      postsApi.myBookmarks().then(res => setBookmarks(res.data.results || res.data)).catch(() => {})
    }
  }, [targetUsername, currentUser?.username])

  const isSelf = currentUser && profile && currentUser.id === profile.id

  const handleToggleFollow = async () => {
    if (!isAuthenticated) {
      showToast('Please login to follow authors', 'info')
      return
    }
    try {
      const res = await authApi.toggleFollow(profile.id)
      setProfile(prev => ({
        ...prev,
        is_following: res.data.is_following,
        followers_count: res.data.followers_count
      }))
      showToast(res.data.message, 'success')
    } catch (err) {
      showToast('Failed to follow author', 'error')
    }
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    try {
      const updated = await updateProfile(editForm)
      setProfile(prev => ({ ...prev, ...updated }))
      setIsEditOpen(false)
      showToast('Profile updated successfully!', 'success')
    } catch (err) {
      showToast('Error updating profile', 'error')
    }
  }

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem' }}>
        <div className="skeleton" style={{ height: '200px', marginBottom: '2rem' }} />
        <div className="skeleton" style={{ height: '300px' }} />
      </div>
    )
  }

  if (!profile) return null

  return (
    <div className="container" style={{ padding: '3rem 1.5rem 6rem 1.5rem' }}>
      
      {/* Profile Header Glass Panel */}
      <div className="glass-panel" style={{ padding: '2.5rem', marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
          
          {/* Avatar & Info */}
          <div style={{ display: 'flex', gap: '1.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <img
              src={profile.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${profile.username}`}
              alt={profile.username}
              style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid var(--accent-primary)',
                boxShadow: 'var(--shadow-glow)'
              }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.25rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
                  {profile.first_name ? `${profile.first_name} ${profile.last_name}` : profile.username}
                </h1>
                <span className="badge badge-primary">{profile.role}</span>
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                @{profile.username}
              </div>

              {profile.bio && (
                <p style={{ color: 'var(--text-secondary)', maxWidth: '580px', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '1rem' }}>
                  {profile.bio}
                </p>
              )}

              {/* Meta pills */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {profile.location && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <MapPin size={14} /> {profile.location}
                  </span>
                )}
                {profile.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--accent-primary)', textDecoration: 'none' }}
                  >
                    <Globe size={14} /> Website
                  </a>
                )}
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Calendar size={14} /> Member since {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>

          {/* Action: Edit Profile or Follow Button */}
          <div>
            {isSelf ? (
              <button onClick={() => setIsEditOpen(true)} className="btn btn-secondary btn-sm">
                <Edit3 size={15} /> Edit Profile
              </button>
            ) : (
              <button
                onClick={handleToggleFollow}
                className={`btn btn-sm ${profile.is_following ? 'btn-secondary' : 'btn-primary'}`}
              >
                {profile.is_following ? <><UserCheck size={15} /> Following</> : <><UserPlus size={15} /> Follow Author</>}
              </button>
            )}
          </div>

        </div>

        {/* Stats Row */}
        <div style={{
          display: 'flex',
          gap: '2.5rem',
          borderTop: '1px solid var(--border-subtle)',
          marginTop: '2rem',
          paddingTop: '1.25rem',
          fontSize: '0.9rem'
        }}>
          <div>
            <strong style={{ color: 'var(--text-primary)', fontSize: '1.15rem' }}>{profile.posts_count || posts.length}</strong>{' '}
            <span style={{ color: 'var(--text-muted)' }}>Articles</span>
          </div>
          <div>
            <strong style={{ color: 'var(--text-primary)', fontSize: '1.15rem' }}>{profile.followers_count || 0}</strong>{' '}
            <span style={{ color: 'var(--text-muted)' }}>Followers</span>
          </div>
          <div>
            <strong style={{ color: 'var(--text-primary)', fontSize: '1.15rem' }}>{profile.following_count || 0}</strong>{' '}
            <span style={{ color: 'var(--text-muted)' }}>Following</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '2rem' }}>
        <button
          onClick={() => setActiveTab('articles')}
          className={`btn ${activeTab === 'articles' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ borderRadius: 'var(--radius-md) var(--radius-md) 0 0' }}
        >
          <FileText size={16} /> Published Articles ({posts.length})
        </button>

        {isSelf && (
          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`btn ${activeTab === 'bookmarks' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ borderRadius: 'var(--radius-md) var(--radius-md) 0 0' }}
          >
            <Bookmark size={16} /> Bookmarked ({bookmarks.length})
          </button>
        )}
      </div>

      {/* Articles Grid */}
      {activeTab === 'articles' && (
        <div>
          {posts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              No published articles yet.
            </div>
          ) : (
            <div className="grid-cards">
              {posts.map(post => <BlogCard key={post.id} post={post} />)}
            </div>
          )}
        </div>
      )}

      {/* Bookmarks Grid */}
      {activeTab === 'bookmarks' && (
        <div>
          {bookmarks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              No bookmarked articles. Save interesting reads to find them here!
            </div>
          ) : (
            <div className="grid-cards">
              {bookmarks.map(post => <BlogCard key={post.id} post={post} />)}
            </div>
          )}
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditOpen && (
        <div className="modal-overlay" onClick={() => setIsEditOpen(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem' }}>Edit Your Profile</h3>
              <button onClick={() => setIsEditOpen(false)} className="btn btn-ghost btn-icon">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editForm.first_name}
                    onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editForm.last_name}
                    onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Bio</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Avatar Image URL</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="https://images.unsplash.com/... or DiceBear seed"
                  value={editForm.avatar}
                  onChange={(e) => setEditForm({ ...editForm, avatar: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Location</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="San Francisco, CA"
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Website</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://yourportfolio.dev"
                  value={editForm.website}
                  onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setIsEditOpen(false)} className="btn btn-secondary btn-sm">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
