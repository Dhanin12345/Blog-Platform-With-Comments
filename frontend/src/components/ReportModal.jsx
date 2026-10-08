import React, { useState } from 'react'
import { AlertTriangle, X, Check } from 'lucide-react'
import { moderationApi } from '../services/api'
import { useToast } from '../context/ToastContext'

export default function ReportModal({ isOpen, onClose, targetType, targetId, targetTitle }) {
  const { showToast } = useToast()
  const [reason, setReason] = useState('SPAM')
  const [details, setDetails] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload = {
        target_type: targetType, // 'POST', 'COMMENT', 'USER'
        reason,
        details,
      }
      if (targetType === 'POST') payload.post = targetId
      if (targetType === 'COMMENT') payload.comment = targetId
      if (targetType === 'USER') payload.reported_user = targetId

      await moderationApi.fileReport(payload)
      showToast('Report submitted for moderator review.', 'success')
      onClose()
    } catch (err) {
      showToast('Failed to submit report. Please try again.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(244, 63, 94, 0.15)',
              color: 'var(--accent-rose)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem' }}>Report Content</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Help maintain community standards</p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-icon" style={{ borderRadius: '50%' }}>
            <X size={18} />
          </button>
        </div>

        {targetTitle && (
          <div style={{
            padding: '0.75rem 1rem',
            background: 'var(--bg-primary)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.85rem',
            marginBottom: '1.25rem',
            color: 'var(--text-secondary)'
          }}>
            Target: <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{targetTitle}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Violation Reason</label>
            <select
              className="form-select"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            >
              <option value="SPAM">Spam or Advertising</option>
              <option value="HARASSMENT">Harassment or Bullying</option>
              <option value="HATE_SPEECH">Hate Speech</option>
              <option value="MISLEADING">Misleading Information</option>
              <option value="COPYRIGHT">Copyright Infringement</option>
              <option value="OTHER">Other Violation</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Additional Details (Optional)</label>
            <textarea
              className="form-textarea"
              placeholder="Provide context for our moderation team..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={3}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary btn-sm">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-danger btn-sm">
              {submitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
