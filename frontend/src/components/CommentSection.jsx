import React, { useState, useEffect } from 'react'
import {
  MessageSquare,
  CornerDownRight,
  Heart,
  Pin,
  Trash2,
  Flag,
  Send,
  MoreVertical,
  Edit2
} from 'lucide-react'
import { commentsApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import ReportModal from './ReportModal'

function CommentItem({
  comment,
  postSlug,
  postAuthorId,
  onReplyAdded,
  onCommentDeleted,
  onCommentUpdated,
  onReport,
  isNested = false,
}) {
  const { user, isAuthenticated } = useAuth()
  const { showToast } = useToast()

  const [isLiked, setIsLiked] = useState(comment.is_liked || false)
  const [likesCount, setLikesCount] = useState(comment.likes_count || 0)
  const [isPinned, setIsPinned] = useState(comment.is_pinned || false)
  const [showReplyBox, setShowReplyBox] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(comment.content)
  const [submitting, setSubmitting] = useState(false)

  const isOwner = user && comment.author?.username === user.username
  const canPin = user && (user.id === postAuthorId || user.role === 'ADMIN')
  const canDelete = isOwner || (user && ['ADMIN', 'MODERATOR'].includes(user.role))

  const handleLike = async () => {
    if (!isAuthenticated) {
      showToast('Login to like comments', 'info')
      return
    }
    try {
      const res = await commentsApi.like(comment.id)
      setIsLiked(res.data.liked)
      setLikesCount(res.data.likes_count)
    } catch (err) {}
  }

  const handlePin = async () => {
    try {
      const res = await commentsApi.pin(comment.id)
      setIsPinned(res.data.is_pinned)
      showToast(res.data.message, 'success')
    } catch (err) {
      showToast('Failed to pin comment', 'error')
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return
    try {
      await commentsApi.delete(comment.id)
      showToast('Comment deleted', 'success')
      onCommentDeleted(comment.id)
    } catch (err) {
      showToast('Failed to delete comment', 'error')
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    if (!editText.trim()) return
    setSubmitting(true)
    try {
      const res = await commentsApi.update(comment.id, { content: editText })
      setIsEditing(false)
      showToast('Comment updated', 'success')
      if (onCommentUpdated) onCommentUpdated(comment.id, editText)
    } catch (err) {
      showToast('Failed to update comment', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReplySubmit = async (e) => {
    e.preventDefault()
    if (!replyText.trim()) return
    setSubmitting(true)
    try {
      const res = await commentsApi.create(postSlug, {
        content: replyText,
        parent: comment.id,
      })
      setReplyText('')
      setShowReplyBox(false)
      showToast('Reply posted!', 'success')
      onReplyAdded(res.data)
    } catch (err) {
      showToast('Failed to post reply', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{
      position: 'relative',
      padding: '1rem',
      borderRadius: 'var(--radius-md)',
      background: isPinned ? 'rgba(99, 102, 241, 0.08)' : 'var(--bg-surface)',
      border: isPinned ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid var(--border-subtle)',
      marginBottom: '0.75rem',
      transition: 'all var(--transition-fast)'
    }}>
      {/* Pinned Tag */}
      {isPinned && (
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.25rem',
          fontSize: '0.7rem',
          color: 'var(--accent-primary)',
          fontWeight: 700,
          marginBottom: '0.5rem',
          textTransform: 'uppercase'
        }}>
          <Pin size={12} /> Pinned Comment
        </div>
      )}

      {/* Author and Date Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <img
            src={comment.author?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${comment.author?.username}`}
            alt={comment.author?.username}
            style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                {comment.author?.first_name ? `${comment.author.first_name} ${comment.author.last_name}` : comment.author?.username}
              </span>
              {comment.author?.role === 'AUTHOR' && <span className="badge badge-primary" style={{ fontSize: '0.6rem' }}>Author</span>}
              {comment.author?.role === 'ADMIN' && <span className="badge badge-amber" style={{ fontSize: '0.6rem' }}>Admin</span>}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              {new Date(comment.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>

        {/* Action icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          {canPin && (
            <button
              onClick={handlePin}
              className="btn btn-ghost btn-icon"
              title={isPinned ? "Unpin comment" : "Pin comment"}
              style={{ color: isPinned ? 'var(--accent-primary)' : 'inherit', padding: '0.35rem' }}
            >
              <Pin size={14} />
            </button>
          )}

          {isOwner && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="btn btn-ghost btn-icon"
              title="Edit comment"
              style={{ padding: '0.35rem' }}
            >
              <Edit2 size={14} />
            </button>
          )}

          {canDelete && (
            <button
              onClick={handleDelete}
              className="btn btn-ghost btn-icon"
              title="Delete comment"
              style={{ color: 'var(--accent-rose)', padding: '0.35rem' }}
            >
              <Trash2 size={14} />
            </button>
          )}

          <button
            onClick={() => onReport('COMMENT', comment.id, `Comment by @${comment.author?.username}`)}
            className="btn btn-ghost btn-icon"
            title="Report comment"
            style={{ padding: '0.35rem' }}
          >
            <Flag size={14} />
          </button>
        </div>
      </div>

      {/* Comment Body */}
      {isEditing ? (
        <form onSubmit={handleUpdate} style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}>
          <textarea
            className="form-textarea"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            rows={2}
          />
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button type="submit" disabled={submitting} className="btn btn-primary btn-sm">Save</button>
            <button type="button" onClick={() => setIsEditing(false)} className="btn btn-ghost btn-sm">Cancel</button>
          </div>
        </form>
      ) : (
        <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
          {comment.content}
        </p>
      )}

      {/* Interactions (Like, Reply toggle) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        <button
          onClick={handleLike}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            background: 'transparent',
            border: 'none',
            color: isLiked ? 'var(--accent-rose)' : 'inherit',
            cursor: 'pointer',
            fontSize: 'inherit'
          }}
        >
          <Heart size={14} fill={isLiked ? 'currentColor' : 'none'} />
          <span>{likesCount}</span>
        </button>

        <button
          onClick={() => setShowReplyBox(!showReplyBox)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            background: 'transparent',
            border: 'none',
            color: 'inherit',
            cursor: 'pointer',
            fontSize: 'inherit'
          }}
        >
          <CornerDownRight size={14} />
          <span>Reply</span>
        </button>
      </div>

      {/* Inline Reply Form */}
      {showReplyBox && (
        <form onSubmit={handleReplySubmit} style={{ marginTop: '0.85rem', paddingLeft: '1rem', borderLeft: '2px solid var(--accent-primary)' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              className="form-input"
              placeholder={`Replying to @${comment.author?.username}...`}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              style={{ fontSize: '0.85rem', padding: '0.5rem 0.75rem' }}
              autoFocus
            />
            <button type="submit" disabled={submitting || !replyText.trim()} className="btn btn-primary btn-sm">
              <Send size={14} />
            </button>
          </div>
        </form>
      )}

      {/* Nested Child Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div style={{
          marginTop: '1rem',
          paddingLeft: '1.25rem',
          borderLeft: '2px solid rgba(99, 102, 241, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              postSlug={postSlug}
              postAuthorId={postAuthorId}
              onReplyAdded={onReplyAdded}
              onCommentDeleted={onCommentDeleted}
              onCommentUpdated={onCommentUpdated}
              onReport={onReport}
              isNested={true}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function CommentSection({ postSlug, postAuthorId }) {
  const { user, isAuthenticated } = useAuth()
  const { showToast } = useToast()

  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Report Modal state
  const [reportModal, setReportModal] = useState({
    isOpen: false,
    targetType: 'COMMENT',
    targetId: null,
    targetTitle: '',
  })

  const fetchComments = async () => {
    try {
      const res = await commentsApi.list(postSlug)
      setComments(res.data.results || res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchComments()
  }, [postSlug])

  const handlePostComment = async (e) => {
    e.preventDefault()
    if (!isAuthenticated) {
      showToast('Please login to post a comment', 'info')
      return
    }
    if (!newComment.trim()) return

    setSubmitting(true)
    try {
      const res = await commentsApi.create(postSlug, { content: newComment })
      setNewComment('')
      showToast('Comment published!', 'success')
      // Append or reload
      fetchComments()
    } catch (err) {
      showToast('Failed to post comment', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReplyAdded = () => {
    fetchComments()
  }

  const handleCommentDeleted = (id) => {
    setComments((prev) => prev.filter((c) => c.id !== id))
    fetchComments()
  }

  const handleCommentUpdated = (id, newContent) => {
    fetchComments()
  }

  const handleOpenReport = (targetType, targetId, targetTitle) => {
    setReportModal({
      isOpen: true,
      targetType,
      targetId,
      targetTitle,
    })
  }

  return (
    <div id="comments" style={{ marginTop: '3rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.5rem' }}>
        <MessageSquare size={22} style={{ color: 'var(--accent-primary)' }} />
        <h3 style={{ fontSize: '1.4rem' }}>Discussion ({comments.length})</h3>
      </div>

      {/* Add Top-Level Comment Form */}
      <form onSubmit={handlePostComment} className="glass-panel" style={{ padding: '1.25rem', marginBottom: '2rem' }}>
        <div className="form-group" style={{ marginBottom: '0.75rem' }}>
          <textarea
            className="form-textarea"
            placeholder={isAuthenticated ? "Share your technical thoughts or ask a question..." : "Log in to join the conversation..."}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={!isAuthenticated || submitting}
            rows={3}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="submit"
            disabled={!isAuthenticated || submitting || !newComment.trim()}
            className="btn btn-primary btn-sm"
          >
            <Send size={15} />
            <span>{submitting ? 'Posting...' : 'Post Comment'}</span>
          </button>
        </div>
      </form>

      {/* Comments List */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div className="skeleton" style={{ height: '80px' }} />
          <div className="skeleton" style={{ height: '80px' }} />
        </div>
      ) : comments.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '3rem 1rem',
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          color: 'var(--text-muted)'
        }}>
          No comments yet. Be the first to share your perspectives!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postSlug={postSlug}
              postAuthorId={postAuthorId}
              onReplyAdded={handleReplyAdded}
              onCommentDeleted={handleCommentDeleted}
              onCommentUpdated={handleCommentUpdated}
              onReport={handleOpenReport}
            />
          ))}
        </div>
      )}

      {/* Report Modal */}
      <ReportModal
        isOpen={reportModal.isOpen}
        onClose={() => setReportModal({ ...reportModal, isOpen: false })}
        targetType={reportModal.targetType}
        targetId={reportModal.targetId}
        targetTitle={reportModal.targetTitle}
      />
    </div>
  )
}
