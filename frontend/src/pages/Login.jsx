import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Sparkles, LogIn, Shield, User, PenTool } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function Login() {
  const { login, demoLogin } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await login(username, password)
      showToast('Welcome back!', 'success')
      navigate('/')
    } catch (err) {
      showToast(err.response?.data?.detail || 'Invalid username or password', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDemo = async (persona) => {
    try {
      await demoLogin(persona)
      showToast(`Logged in as demo persona: ${persona}`, 'success')
      navigate('/')
    } catch (err) {
      showToast('Demo login failed', 'error')
    }
  }

  return (
    <div className="container" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem' }}>
      <div className="glass-panel-elevated" style={{ width: '100%', maxWidth: '440px', padding: '2.5rem' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--accent-gradient)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            marginBottom: '1rem',
            boxShadow: 'var(--shadow-glow)'
          }}>
            <Sparkles size={24} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Welcome Back</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            Enter your credentials or choose a 1-click test persona
          </p>
        </div>

        {/* 1-Click Demo Personas */}
        <div style={{ marginBottom: '1.75rem', padding: '1rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.65rem', textAlign: 'center' }}>
            Instant Demo Sign-In
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <button type="button" onClick={() => handleDemo('admin')} className="btn btn-secondary btn-sm" style={{ fontSize: '0.75rem', justifyContent: 'flex-start' }}>
              👑 Admin
            </button>
            <button type="button" onClick={() => handleDemo('moderator')} className="btn btn-secondary btn-sm" style={{ fontSize: '0.75rem', justifyContent: 'flex-start' }}>
              🛡️ Moderator
            </button>
            <button type="button" onClick={() => handleDemo('sarah_dev')} className="btn btn-secondary btn-sm" style={{ fontSize: '0.75rem', justifyContent: 'flex-start' }}>
              ✍️ Author (Sarah)
            </button>
            <button type="button" onClick={() => handleDemo('emily_r')} className="btn btn-secondary btn-sm" style={{ fontSize: '0.75rem', justifyContent: 'flex-start' }}>
              👤 Reader (Emily)
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.5rem 0', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
          <span>OR SIGN IN MANUALLY</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              type="text"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. admin or sarah_dev"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Default seed password: <code>Password123!</code>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1rem' }}
          >
            <LogIn size={16} /> {submitting ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--accent-primary)', fontWeight: 600, textDecoration: 'none' }}>
            Register here
          </Link>
        </div>

      </div>
    </div>
  )
}
