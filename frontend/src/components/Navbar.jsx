import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  Sparkles,
  PenTool,
  Bell,
  Sun,
  Moon,
  Search,
  User as UserIcon,
  LogOut,
  Shield,
  BarChart3,
  CheckCheck,
  ChevronDown,
  Layers,
  Flame,
  Bookmark
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useToast } from '../context/ToastContext'
import { notificationsApi } from '../services/api'

export default function Navbar() {
  const { user, isAuthenticated, logout, demoLogin } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  const [searchQuery, setSearchQuery] = useState('')
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showDemoSelector, setShowDemoSelector] = useState(false)

  // Fetch unread notifications
  useEffect(() => {
    if (isAuthenticated) {
      notificationsApi.getUnreadCount()
        .then(res => setUnreadCount(res.data.unread_count))
        .catch(() => {})
    }
  }, [isAuthenticated, location.pathname])

  const handleOpenNotifications = async () => {
    if (!showNotifications) {
      try {
        const res = await notificationsApi.list()
        setNotifications(res.data.results || res.data)
      } catch (err) {}
    }
    setShowNotifications(!showNotifications)
  }

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllRead()
      setUnreadCount(0)
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      showToast('All notifications marked as read', 'success')
    } catch (err) {}
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleSwitchPersona = async (persona) => {
    try {
      await demoLogin(persona)
      setShowDemoSelector(false)
      showToast(`Switched persona to: ${persona}`, 'success')
      navigate('/')
    } catch (err) {
      showToast('Failed to switch persona', 'error')
    }
  }

  const isAuthorOrAdmin = user && (user.role === 'AUTHOR' || user.role === 'ADMIN')
  const isModOrAdmin = user && (user.role === 'MODERATOR' || user.role === 'ADMIN')

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'var(--bg-glass-elevated)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border-subtle)',
      transition: 'all var(--transition-normal)'
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '70px', gap: '1rem' }}>
        
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--accent-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: 'var(--shadow-glow)'
          }}>
            <Sparkles size={20} />
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
            Blog<span className="gradient-text">Sphere</span>
          </span>
        </Link>

        {/* Global Search Bar */}
        <form onSubmit={handleSearchSubmit} style={{ flex: '1', maxWidth: '380px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search blogs, topics, authors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '2.4rem', height: '40px', fontSize: '0.875rem' }}
          />
        </form>

        {/* Nav Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link to="/" className="btn btn-ghost btn-sm" style={{ fontWeight: 600 }}>Home</Link>
          <Link to="/feed" className="btn btn-ghost btn-sm" style={{ fontWeight: 600 }}>Your Feed</Link>
          
          {/* Quick Demo Persona Switcher */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowDemoSelector(!showDemoSelector)}
              className="btn btn-secondary btn-sm"
              title="Quickly switch personas to test permissions"
              style={{ fontSize: '0.75rem', borderColor: 'rgba(99, 102, 241, 0.4)', background: 'rgba(99, 102, 241, 0.08)' }}
            >
              <Shield size={13} style={{ color: 'var(--accent-primary)' }} />
              <span>Persona: {user?.role || 'Guest'}</span>
              <ChevronDown size={12} />
            </button>

            {showDemoSelector && (
              <div className="glass-panel-elevated" style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '210px',
                padding: '0.5rem',
                borderRadius: 'var(--radius-md)',
                zIndex: 200
              }}>
                <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', padding: '0.25rem 0.5rem', fontWeight: 700 }}>
                  Switch Test Persona
                </div>
                <button onClick={() => handleSwitchPersona('admin')} className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'flex-start' }}>
                  👑 Admin (Full Access)
                </button>
                <button onClick={() => handleSwitchPersona('moderator')} className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'flex-start' }}>
                  🛡️ Moderator (Review)
                </button>
                <button onClick={() => handleSwitchPersona('sarah_dev')} className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'flex-start' }}>
                  ✍️ Sarah (Author)
                </button>
                <button onClick={() => handleSwitchPersona('alex_ai')} className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'flex-start' }}>
                  🤖 Alex AI (Author)
                </button>
                <button onClick={() => handleSwitchPersona('emily_r')} className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'flex-start' }}>
                  👤 Emily (Reader / User)
                </button>
              </div>
            )}
          </div>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="btn btn-ghost btn-icon"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Write Post Button */}
          {isAuthenticated && (
            <Link to="/create-post" className="btn btn-gradient btn-sm">
              <PenTool size={15} />
              <span>Write</span>
            </Link>
          )}

          {/* Notifications Dropdown */}
          {isAuthenticated && (
            <div style={{ position: 'relative' }}>
              <button
                onClick={handleOpenNotifications}
                className="btn btn-ghost btn-icon"
                style={{ position: 'relative' }}
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    width: '8px',
                    height: '8px',
                    backgroundColor: 'var(--accent-rose)',
                    borderRadius: '50%',
                    boxShadow: '0 0 6px var(--accent-rose)'
                  }} />
                )}
              </button>

              {showNotifications && (
                <div className="glass-panel-elevated" style={{
                  position: 'absolute',
                  top: 'calc(100% + 10px)',
                  right: 0,
                  width: '320px',
                  maxHeight: '400px',
                  overflowY: 'auto',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1rem',
                  zIndex: 200
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <h4 style={{ fontSize: '0.9rem' }}>Notifications ({unreadCount})</h4>
                    {unreadCount > 0 && (
                      <button onClick={handleMarkAllRead} className="btn btn-ghost btn-sm" style={{ fontSize: '0.75rem', padding: '0.2rem 0.4rem' }}>
                        <CheckCheck size={14} /> Mark all read
                      </button>
                    )}
                  </div>

                  {notifications.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      No notifications yet.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {notifications.map((n) => (
                        <div
                          key={n.id}
                          style={{
                            padding: '0.65rem',
                            borderRadius: 'var(--radius-sm)',
                            background: n.is_read ? 'transparent' : 'rgba(99, 102, 241, 0.1)',
                            border: '1px solid var(--border-subtle)',
                            fontSize: '0.8rem'
                          }}
                        >
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{n.title}</div>
                          <div style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>{n.message}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* User Profile / Auth Links */}
          {isAuthenticated ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="btn btn-ghost btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.6rem' }}
              >
                <img
                  src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`}
                  alt={user.username}
                  style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user.username}</span>
                <ChevronDown size={13} />
              </button>

              {showUserMenu && (
                <div className="glass-panel-elevated" style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  width: '210px',
                  padding: '0.5rem',
                  borderRadius: 'var(--radius-md)',
                  zIndex: 200
                }}>
                  <div style={{ padding: '0.5rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '0.35rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{user.username}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</div>
                    <span className="badge badge-primary" style={{ marginTop: '0.35rem', fontSize: '0.65rem' }}>
                      {user.role}
                    </span>
                  </div>

                  <Link to={`/author/${user.username}`} onClick={() => setShowUserMenu(false)} className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'flex-start' }}>
                    <UserIcon size={14} /> Profile
                  </Link>
                  <Link to="/bookmarks" onClick={() => setShowUserMenu(false)} className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'flex-start' }}>
                    <Bookmark size={14} /> Saved Posts
                  </Link>
                  {isAuthorOrAdmin && (
                    <Link to="/analytics" onClick={() => setShowUserMenu(false)} className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'flex-start' }}>
                      <BarChart3 size={14} /> Analytics Studio
                    </Link>
                  )}
                  {isModOrAdmin && (
                    <Link to="/admin" onClick={() => setShowUserMenu(false)} className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'flex-start', color: 'var(--accent-amber)' }}>
                      <Shield size={14} /> Admin & Moderation
                    </Link>
                  )}

                  <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: '0.35rem', paddingTop: '0.35rem' }}>
                    <button
                      onClick={() => { setShowUserMenu(false); logout(); showToast('Logged out successfully', 'info'); }}
                      className="btn btn-ghost btn-sm"
                      style={{ width: '100%', justifyContent: 'flex-start', color: 'var(--accent-rose)' }}
                    >
                      <LogOut size={14} /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </div>
          )}

        </div>
      </div>
    </nav>
  )
}
