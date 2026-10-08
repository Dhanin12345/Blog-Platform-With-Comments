import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Shield,
  Users,
  FileText,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Activity,
  UserCheck,
  UserX,
  Search
} from 'lucide-react'
import { moderationApi, authApi, analyticsApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('reports') // 'reports', 'users', 'audit'
  const [platformStats, setPlatformStats] = useState(null)
  const [reports, setReports] = useState([])
  const [usersList, setUsersList] = useState([])
  const [auditLogs, setAuditLogs] = useState([])
  const [loading, setLoading] = useState(true)

  const [userSearch, setUserSearch] = useState('')

  useEffect(() => {
    if (!isAuthenticated || !['ADMIN', 'MODERATOR'].includes(user?.role)) {
      showToast('Restricted: Admin or Moderator access required', 'error')
      navigate('/')
      return
    }

    const loadAdminData = async () => {
      try {
        const [statsRes, reportsRes, auditRes] = await Promise.all([
          analyticsApi.getPlatformStats(),
          moderationApi.listReports(),
          moderationApi.listAuditLogs(),
        ])
        setPlatformStats(statsRes.data)
        setReports(reportsRes.data.results || reportsRes.data)
        setAuditLogs(auditRes.data.results || auditRes.data)

        if (user.role === 'ADMIN') {
          const uRes = await authApi.listUsers()
          setUsersList(uRes.data.results || uRes.data)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadAdminData()
  }, [isAuthenticated, user?.role])

  const handleResolveReport = async (reportId, actionType) => {
    const notes = prompt(`Enter resolution notes for action [${actionType}]:`, 'Processed according to community guidelines.')
    if (notes === null) return

    try {
      await moderationApi.resolveReport(reportId, { action_type: actionType, notes })
      showToast(`Report #${reportId} resolved with action: ${actionType}`, 'success')
      // Refresh reports
      const res = await moderationApi.listReports()
      setReports(res.data.results || res.data)
    } catch (err) {
      showToast('Failed to resolve report', 'error')
    }
  }

  const handleUpdateRole = async (userId, newRole) => {
    try {
      await authApi.updateUserRole(userId, { role: newRole })
      showToast(`Updated role to ${newRole}`, 'success')
      setUsersList(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u))
    } catch (err) {
      showToast('Error updating role', 'error')
    }
  }

  const handleToggleActive = async (userId, currentStatus) => {
    try {
      await authApi.updateUserRole(userId, { is_active: !currentStatus })
      showToast(`User ${!currentStatus ? 'activated' : 'suspended'}`, 'success')
      setUsersList(prev => prev.map(u => u.id === userId ? { ...u, is_active: !currentStatus } : u))
    } catch (err) {
      showToast('Error updating account state', 'error')
    }
  }

  const filteredUsers = usersList.filter(u =>
    u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  )

  return (
    <div className="container" style={{ padding: '3rem 1.5rem 6rem 1.5rem' }}>
      
      {/* Admin Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.4rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff'
            }}>
              <Shield size={22} />
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Administration & Moderation Command Center</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Platform health, trust & safety enforcement, user role allocation, and audit trails.
          </p>
        </div>
        <span className="badge badge-amber" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
          Operator: {user?.username} ({user?.role})
        </span>
      </div>

      {/* Overview Stat Cards */}
      {platformStats && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2.5rem'
        }}>
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Total Registered</span>
              <Users size={16} />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{platformStats.total_users}</div>
          </div>

          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Total Posts</span>
              <FileText size={16} />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{platformStats.total_posts}</div>
          </div>

          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Total Comments</span>
              <MessageSquare size={16} />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{platformStats.total_comments}</div>
          </div>

          <div className="glass-panel" style={{ padding: '1.25rem', border: '1px solid rgba(244, 63, 94, 0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--accent-rose)', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Pending Reports</span>
              <AlertTriangle size={16} />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-rose)' }}>
              {platformStats.pending_reports}
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '2rem' }}>
        <button
          onClick={() => setActiveTab('reports')}
          className={`btn ${activeTab === 'reports' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ borderRadius: 'var(--radius-md) var(--radius-md) 0 0' }}
        >
          <AlertTriangle size={16} /> Moderation Queue ({reports.filter(r => r.status === 'PENDING').length})
        </button>

        {user?.role === 'ADMIN' && (
          <button
            onClick={() => setActiveTab('users')}
            className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ borderRadius: 'var(--radius-md) var(--radius-md) 0 0' }}
          >
            <Users size={16} /> User Management
          </button>
        )}

        <button
          onClick={() => setActiveTab('audit')}
          className={`btn ${activeTab === 'audit' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ borderRadius: 'var(--radius-md) var(--radius-md) 0 0' }}
        >
          <Activity size={16} /> Audit & Security Trail
        </button>
      </div>

      {/* TAB 1: MODERATION REPORTS */}
      {activeTab === 'reports' && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.25rem' }}>Content Moderation Queue</h3>

          {reports.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
              No reports filed. Everything is pristine!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {reports.map((report) => (
                <div
                  key={report.id}
                  style={{
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="badge badge-rose">{report.reason}</span>
                      <span className="badge badge-primary">{report.target_type}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Report #{report.id} by @{report.reporter?.username}
                      </span>
                    </div>
                    <span className={`badge ${report.status === 'PENDING' ? 'badge-amber' : 'badge-emerald'}`}>
                      {report.status}
                    </span>
                  </div>

                  {report.details && (
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', background: 'var(--bg-primary)', padding: '0.65rem', borderRadius: 'var(--radius-sm)' }}>
                      <strong>Details:</strong> {report.details}
                    </div>
                  )}

                  {report.target_summary && (
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      <strong>Target:</strong> {JSON.stringify(report.target_summary)}
                    </div>
                  )}

                  {report.action_taken && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--accent-emerald)' }}>
                      ✓ Action: {report.action_taken}
                    </div>
                  )}

                  {report.status === 'PENDING' && (
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => handleResolveReport(report.id, 'REMOVE_CONTENT')}
                        className="btn btn-danger btn-sm"
                      >
                        Remove Content
                      </button>
                      <button
                        onClick={() => handleResolveReport(report.id, 'WARN_USER')}
                        className="btn btn-secondary btn-sm"
                      >
                        Issue Warning
                      </button>
                      <button
                        onClick={() => handleResolveReport(report.id, 'SUSPEND_USER')}
                        className="btn btn-danger btn-sm"
                      >
                        Suspend User
                      </button>
                      <button
                        onClick={() => handleResolveReport(report.id, 'DISMISS')}
                        className="btn btn-ghost btn-sm"
                      >
                        Dismiss Report
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: USER MANAGEMENT */}
      {activeTab === 'users' && user?.role === 'ADMIN' && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>User Directory & Roles</h3>
            <div style={{ position: 'relative', width: '280px' }}>
              <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search username or email..."
                className="form-input"
                style={{ paddingLeft: '2.2rem', height: '36px', fontSize: '0.85rem' }}
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.75rem' }}>User</th>
                  <th style={{ padding: '0.75rem' }}>Email</th>
                  <th style={{ padding: '0.75rem' }}>Role</th>
                  <th style={{ padding: '0.75rem' }}>Status</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.85rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <img
                        src={u.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.username}`}
                        alt={u.username}
                        style={{ width: '32px', height: '32px', borderRadius: '50%' }}
                      />
                      <span style={{ fontWeight: 600 }}>{u.username}</span>
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem', color: 'var(--text-secondary)' }}>{u.email}</td>
                    <td style={{ padding: '0.85rem 0.75rem' }}>
                      <select
                        className="form-select"
                        value={u.role}
                        onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', width: 'auto' }}
                      >
                        <option value="USER">USER</option>
                        <option value="AUTHOR">AUTHOR</option>
                        <option value="MODERATOR">MODERATOR</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem' }}>
                      <span className={`badge ${u.is_active ? 'badge-emerald' : 'badge-rose'}`}>
                        {u.is_active ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem', textAlign: 'right' }}>
                      <button
                        onClick={() => handleToggleActive(u.id, u.is_active)}
                        className={`btn btn-sm ${u.is_active ? 'btn-danger' : 'btn-secondary'}`}
                        style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                      >
                        {u.is_active ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.25rem' }}>Security Audit Trail</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {auditLogs.map((log) => (
              <div
                key={log.id}
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.825rem'
                }}
              >
                <div>
                  <span style={{ fontWeight: 600, color: 'var(--accent-primary)', marginRight: '0.5rem' }}>
                    [{log.action}]
                  </span>
                  <span style={{ color: 'var(--text-secondary)' }}>{log.details}</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  {new Date(log.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
