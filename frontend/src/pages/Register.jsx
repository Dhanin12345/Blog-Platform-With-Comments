import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Sparkles, UserPlus, PenTool, BookOpen } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function Register() {
  const { register } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
    role: 'AUTHOR', // 'AUTHOR' or 'USER'
    bio: '',
  })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (formData.password !== formData.password2) {
      showToast('Passwords do not match', 'error')
      return
    }

    setSubmitting(true)
    try {
      await register(formData)
      showToast('Registration complete! Welcome to BlogSphere.', 'success')
      navigate('/')
    } catch (err) {
      const msg = err.response?.data?.username?.[0] || err.response?.data?.email?.[0] || 'Registration failed'
      showToast(msg, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container" style={{ minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem' }}>
      <div className="glass-panel-elevated" style={{ width: '100%', maxWidth: '480px', padding: '2.5rem' }}>
        
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
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Join BlogSphere</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            Publish your insights, join technical discussions, and build an engineering following.
          </p>
        </div>

        {/* Role Toggle Selector */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div
            onClick={() => setFormData({ ...formData, role: 'AUTHOR' })}
            style={{
              padding: '0.85rem',
              borderRadius: 'var(--radius-md)',
              border: formData.role === 'AUTHOR' ? '2px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
              background: formData.role === 'AUTHOR' ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-surface)',
              cursor: 'pointer',
              textAlign: 'center'
            }}
          >
            <PenTool size={20} style={{ color: 'var(--accent-primary)', marginBottom: '0.25rem' }} />
            <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>Author / Creator</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Write, draft & publish</div>
          </div>

          <div
            onClick={() => setFormData({ ...formData, role: 'USER' })}
            style={{
              padding: '0.85rem',
              borderRadius: 'var(--radius-md)',
              border: formData.role === 'USER' ? '2px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
              background: formData.role === 'USER' ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-surface)',
              cursor: 'pointer',
              textAlign: 'center'
            }}
          >
            <BookOpen size={20} style={{ color: 'var(--accent-emerald)', marginBottom: '0.25rem' }} />
            <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>Reader / Explorer</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Read, comment & like</div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              type="text"
              className="form-input"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="e.g. dev_sarah"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="sarah@example.com"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                className="form-input"
                value={formData.password2}
                onChange={(e) => setFormData({ ...formData, password2: e.target.value })}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Bio (Optional)</label>
            <textarea
              className="form-textarea"
              rows={2}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell the community what you specialize in..."
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1rem' }}
          >
            <UserPlus size={16} /> {submitting ? 'Creating Profile...' : 'Complete Registration'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent-primary)', fontWeight: 600, textDecoration: 'none' }}>
            Sign in
          </Link>
        </div>

      </div>
    </div>
  )
}
