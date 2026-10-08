import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Sparkles,
  Save,
  Send,
  Eye,
  FileCode,
  Image,
  Upload,
  Calendar,
  Tag,
  FolderTree,
  ChevronDown,
  ChevronUp,
  ArrowLeft
} from 'lucide-react'
import { postsApi, categoriesApi, uploadApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import AiAssistantDrawer from '../components/AiAssistantDrawer'

export default function CreateEditPost() {
  const { slug } = useParams()
  const isEditing = Boolean(slug)
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const { showToast } = useToast()

  const [categories, setCategories] = useState([])
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: '',
    tag_names: [],
    tagInput: '',
    featured_image: '',
    status: 'PUBLISHED', // 'DRAFT', 'PUBLISHED', 'SCHEDULED'
    scheduled_for: '',
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
  })

  const [isPreview, setIsPreview] = useState(false)
  const [showSeo, setShowSeo] = useState(false)
  const [isAiOpen, setIsAiOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      showToast('Please login to create or edit posts', 'info')
      navigate('/login')
      return
    }

    // Load categories
    categoriesApi.list().then(res => setCategories(res.data.results || res.data)).catch(() => {})

    // If editing, load post
    if (isEditing) {
      postsApi.get(slug).then(res => {
        const p = res.data
        setFormData({
          title: p.title || '',
          content: p.content || '',
          excerpt: p.excerpt || '',
          category: p.category?.id || '',
          tag_names: p.tags ? p.tags.map(t => t.name) : [],
          tagInput: '',
          featured_image: p.featured_image || '',
          status: p.status || 'PUBLISHED',
          scheduled_for: p.scheduled_for ? p.scheduled_for.slice(0, 16) : '',
          meta_title: p.meta_title || '',
          meta_description: p.meta_description || '',
          meta_keywords: p.meta_keywords || '',
        })
      }).catch(err => {
        showToast('Error loading article', 'error')
        navigate('/')
      })
    }
  }, [slug, isAuthenticated])

  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const cleanTag = formData.tagInput.trim().replace(/^#/, '').toLowerCase()
      if (cleanTag && !formData.tag_names.includes(cleanTag)) {
        setFormData(prev => ({
          ...prev,
          tag_names: [...prev.tag_names, cleanTag],
          tagInput: ''
        }))
      }
    }
  }

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tag_names: prev.tag_names.filter(t => t !== tagToRemove)
    }))
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const uploadForm = new FormData()
    uploadForm.append('file', file)

    setUploadingImage(true)
    try {
      const res = await uploadApi.uploadImage(uploadForm)
      setFormData(prev => ({ ...prev, featured_image: res.data.url }))
      showToast('Image uploaded successfully!', 'success')
    } catch (err) {
      showToast('Failed to upload image', 'error')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (submitStatus) => {
    if (!formData.title.trim()) {
      showToast('Please enter an article title', 'error')
      return
    }
    if (!formData.content.trim()) {
      showToast('Please enter content for the article', 'error')
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        title: formData.title,
        content: formData.content,
        excerpt: formData.excerpt,
        category: formData.category || null,
        tag_names: formData.tag_names,
        featured_image: formData.featured_image,
        status: submitStatus || formData.status,
        scheduled_for: submitStatus === 'SCHEDULED' ? formData.scheduled_for : null,
        meta_title: formData.meta_title,
        meta_description: formData.meta_description,
        meta_keywords: formData.meta_keywords,
      }

      let res
      if (isEditing) {
        res = await postsApi.update(slug, payload)
        showToast('Article updated successfully!', 'success')
      } else {
        res = await postsApi.create(payload)
        showToast('Article created successfully!', 'success')
      }

      navigate(`/post/${res.data.slug}`)
    } catch (err) {
      console.error(err)
      showToast('Failed to save article. Please check input.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  // Live estimated reading time
  const estimatedReadingTime = Math.max(1, Math.ceil((formData.content.split(/\s+/).length || 1) / 200))

  return (
    <div className="container-narrow" style={{ padding: '3rem 1.5rem 6rem 1.5rem' }}>
      
      {/* Top Bar with actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm">
          <ArrowLeft size={16} /> Back
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* AI Trigger */}
          <button
            onClick={() => setIsAiOpen(true)}
            className="btn btn-gradient btn-sm"
            title="Open AI writing assistant"
          >
            <Sparkles size={15} /> AI Assistant
          </button>

          {/* Toggle Preview */}
          <button
            onClick={() => setIsPreview(!isPreview)}
            className="btn btn-secondary btn-sm"
          >
            {isPreview ? <><FileCode size={15} /> Edit Mode</> : <><Eye size={15} /> Live Preview</>}
          </button>

          {/* Save Draft */}
          <button
            onClick={() => handleSubmit('DRAFT')}
            disabled={submitting}
            className="btn btn-secondary btn-sm"
          >
            <Save size={15} /> Save Draft
          </button>

          {/* Publish / Update */}
          <button
            onClick={() => handleSubmit('PUBLISHED')}
            disabled={submitting}
            className="btn btn-primary btn-sm"
          >
            <Send size={15} /> {isEditing ? 'Save & Update' : 'Publish Now'}
          </button>
        </div>
      </div>

      {/* Editor Body */}
      {isPreview ? (
        <div className="glass-panel" style={{ padding: '2.5rem' }}>
          <span className="badge badge-primary" style={{ marginBottom: '1rem' }}>
            {categories.find(c => c.id === Number(formData.category))?.name || 'General'}
          </span>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>
            {formData.title || 'Untitled Article'}
          </h1>
          {formData.featured_image && (
            <img
              src={formData.featured_image}
              alt="Featured"
              style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: 'var(--radius-lg)', marginBottom: '2rem' }}
            />
          )}
          <div style={{ fontSize: '1.1rem', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
            {formData.content || 'Start typing in edit mode to see your content rendered here...'}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Title Input */}
          <input
            type="text"
            placeholder="Enter an intriguing, insightful title..."
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            style={{
              width: '100%',
              fontSize: '2rem',
              fontWeight: 800,
              background: 'transparent',
              border: 'none',
              borderBottom: '2px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              padding: '0.5rem 0',
              outline: 'none',
              fontFamily: 'var(--font-sans)'
            }}
          />

          {/* Meta Toolbar: Category, Tags, Status, Reading Time */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            
            {/* Category */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">
                <FolderTree size={14} style={{ display: 'inline', marginRight: '4px' }} /> Category
              </label>
              <select
                className="form-select"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="">Select a category...</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Publishing Status */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Post Status</label>
              <select
                className="form-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>

            {/* Reading Time Badge */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <label className="form-label">Estimated Length</label>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                ~{estimatedReadingTime} min read ({formData.content.split(/\s+/).filter(Boolean).length} words)
              </div>
            </div>

          </div>

          {/* Scheduled Date Picker (if status == SCHEDULED) */}
          {formData.status === 'SCHEDULED' && (
            <div className="form-group">
              <label className="form-label">
                <Calendar size={14} style={{ display: 'inline', marginRight: '4px' }} /> Schedule Release Date & Time
              </label>
              <input
                type="datetime-local"
                className="form-input"
                value={formData.scheduled_for}
                onChange={(e) => setFormData({ ...formData, scheduled_for: e.target.value })}
              />
            </div>
          )}

          {/* Featured Image URL & Upload */}
          <div className="form-group">
            <label className="form-label">Featured Image URL or Upload</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                className="form-input"
                placeholder="https://images.unsplash.com/... or upload below"
                value={formData.featured_image}
                onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
              />
              <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}>
                <Upload size={14} /> {uploadingImage ? 'Uploading...' : 'Upload'}
                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
              </label>
            </div>
          </div>

          {/* Tags Multi-Input */}
          <div className="form-group">
            <label className="form-label">
              <Tag size={14} style={{ display: 'inline', marginRight: '4px' }} /> Tags (Press Enter or Comma to add)
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.5rem' }}>
              {formData.tag_names.map(tag => (
                <span key={tag} className="tag-pill" style={{ cursor: 'pointer' }} onClick={() => handleRemoveTag(tag)}>
                  #{tag} &times;
                </span>
              ))}
            </div>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. react, python, architecture..."
              value={formData.tagInput}
              onChange={(e) => setFormData({ ...formData, tagInput: e.target.value })}
              onKeyDown={handleAddTag}
            />
          </div>

          {/* Main Markdown / Text Content Editor */}
          <div className="form-group">
            <label className="form-label">Article Content</label>
            <textarea
              className="form-textarea"
              placeholder="Write your comprehensive technical insights here..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={18}
              style={{ fontFamily: 'var(--font-sans)', fontSize: '1rem', lineHeight: 1.7 }}
            />
          </div>

          {/* Excerpt */}
          <div className="form-group">
            <label className="form-label">Excerpt / Teaser Summary</label>
            <textarea
              className="form-textarea"
              placeholder="A concise synopsis displayed on cards and search results..."
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              rows={2}
            />
          </div>

          {/* SEO Metadata Accordion */}
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <button
              type="button"
              onClick={() => setShowSeo(!showSeo)}
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer'
              }}
            >
              <span>Search Engine Optimization (SEO) & Social Sharing Metadata</span>
              {showSeo ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {showSeo && (
              <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Meta Title</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.meta_title}
                    onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Meta Description</label>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    value={formData.meta_description}
                    onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Meta Keywords</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="software, distributed systems, clean code"
                    value={formData.meta_keywords}
                    onChange={(e) => setFormData({ ...formData, meta_keywords: e.target.value })}
                  />
                </div>
              </div>
            )}
          </div>

        </div>
      )}

      {/* Modular AI Writing Assistant Drawer */}
      <AiAssistantDrawer
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        currentTitle={formData.title}
        currentContent={formData.content}
        onApplyTitle={(t) => setFormData(prev => ({ ...prev, title: t }))}
        onApplySummary={(s) => setFormData(prev => ({ ...prev, excerpt: s, meta_description: s }))}
        onApplyTags={(tags) => setFormData(prev => ({ ...prev, tag_names: Array.from(new Set([...prev.tag_names, ...tags])) }))}
        onApplyCategory={(catId) => setFormData(prev => ({ ...prev, category: catId }))}
        onApplyImprovedContent={(c) => setFormData(prev => ({ ...prev, content: c }))}
      />

    </div>
  )
}
