import React from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, Github, Twitter, Linkedin, Heart, Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer style={{
      marginTop: 'auto',
      borderTop: '1px solid var(--border-subtle)',
      background: 'var(--bg-secondary)',
      padding: '4rem 0 2rem 0',
      position: 'relative',
      zIndex: 10
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '2.5rem',
          marginBottom: '3rem'
        }}>
          {/* Brand Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--accent-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff'
              }}>
                <Sparkles size={18} />
              </div>
              <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                Blog<span className="gradient-text">Sphere</span>
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              The high-performance engineering & community blogging ecosystem. Built with Django REST Framework, React, and modular AI assistance.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <a href="#" className="btn btn-ghost btn-icon" style={{ borderRadius: '50%' }}><Github size={18} /></a>
              <a href="#" className="btn btn-ghost btn-icon" style={{ borderRadius: '50%' }}><Twitter size={18} /></a>
              <a href="#" className="btn btn-ghost btn-icon" style={{ borderRadius: '50%' }}><Linkedin size={18} /></a>
            </div>
          </div>

          {/* Quick Explore */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>Explore</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.875rem' }}>
              <li><Link to="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Trending Articles</Link></li>
              <li><Link to="/feed" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Personalized Feed</Link></li>
              <li><Link to="/?category=technology" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Cloud & Architecture</Link></li>
              <li><Link to="/?category=artificial-intelligence" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Artificial Intelligence</Link></li>
              <li><Link to="/?category=web-development" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Modern Web & React</Link></li>
            </ul>
          </div>

          {/* Platform & Roles */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>Platform</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.875rem' }}>
              <li><Link to="/create-post" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Author Studio</Link></li>
              <li><Link to="/analytics" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Analytics Dashboard</Link></li>
              <li><Link to="/admin" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Administration & Moderation</Link></li>
              <li><Link to="/bookmarks" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Saved Bookmarks</Link></li>
            </ul>
          </div>

          {/* Newsletter Subscribe */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem' }}>Weekly Digest</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.5 }}>
              Hand-picked architectural insights, AI breakthroughs, and frontend mastery delivered every Monday.
            </p>
            <form onSubmit={(e) => { e.preventDefault(); alert('Subscribed to BlogSphere Weekly Digest!'); }} style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="email"
                placeholder="developer@company.com"
                className="form-input"
                style={{ fontSize: '0.85rem', padding: '0.5rem 0.75rem' }}
                required
              />
              <button type="submit" className="btn btn-primary btn-sm">
                <Mail size={14} />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.8rem',
          color: 'var(--text-muted)'
        }}>
          <div>
            © 2026 BlogSphere Platform Inc. All rights reserved.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            Built with <Heart size={13} style={{ color: 'var(--accent-rose)', fill: 'var(--accent-rose)' }} /> for passionate engineers and writers.
          </div>
        </div>
      </div>
    </footer>
  )
}
