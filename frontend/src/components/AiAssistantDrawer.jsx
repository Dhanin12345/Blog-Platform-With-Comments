import React, { useState } from 'react'
import {
  Sparkles,
  Wand2,
  Tag,
  FolderTree,
  FileText,
  Check,
  RefreshCw,
  X,
  ChevronRight,
  ArrowRight
} from 'lucide-react'
import { aiApi } from '../services/api'
import { useToast } from '../context/ToastContext'

export default function AiAssistantDrawer({
  isOpen,
  onClose,
  currentTitle,
  currentContent,
  onApplyTitle,
  onApplySummary,
  onApplyTags,
  onApplyCategory,
  onApplyImprovedContent
}) {
  const { showToast } = useToast()

  const [activeTab, setActiveTab] = useState('titles') // 'titles', 'tags', 'summary', 'category', 'improve'
  const [loading, setLoading] = useState(false)

  const [generatedTitles, setGeneratedTitles] = useState([])
  const [suggestedTags, setSuggestedTags] = useState([])
  const [generatedSummary, setGeneratedSummary] = useState('')
  const [categoryPrediction, setCategoryPrediction] = useState(null)
  const [improvedContent, setImprovedContent] = useState('')

  if (!isOpen) return null

  const handleGenerateTitles = async () => {
    setLoading(true)
    try {
      const res = await aiApi.generateTitles({ title: currentTitle, content: currentContent })
      setGeneratedTitles(res.data.titles)
      showToast('Generated 5 high-impact titles!', 'success')
    } catch (err) {
      showToast('Error generating titles', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleSuggestTags = async () => {
    setLoading(true)
    try {
      const res = await aiApi.suggestTags({ title: currentTitle, content: currentContent })
      setSuggestedTags(res.data.tags)
      showToast('Tags suggested successfully!', 'success')
    } catch (err) {
      showToast('Error suggesting tags', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateSummary = async () => {
    setLoading(true)
    try {
      const res = await aiApi.generateSummary({ title: currentTitle, content: currentContent })
      setGeneratedSummary(res.data.summary)
      showToast('Generated executive summary!', 'success')
    } catch (err) {
      showToast('Error generating summary', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleClassifyCategory = async () => {
    setLoading(true)
    try {
      const res = await aiApi.classifyCategory({ title: currentTitle, content: currentContent })
      setCategoryPrediction(res.data)
      showToast('Category classified!', 'success')
    } catch (err) {
      showToast('Error classifying category', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleImproveWriting = async () => {
    setLoading(true)
    try {
      const res = await aiApi.improveWriting({ content: currentContent })
      setImprovedContent(res.data.improved_content)
      showToast('Refined text for clarity and impact!', 'success')
    } catch (err) {
      showToast('Error improving writing', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      width: '420px',
      maxWidth: '90vw',
      height: '100vh',
      background: 'var(--bg-glass-elevated)',
      backdropFilter: 'blur(25px)',
      WebkitBackdropFilter: 'blur(25px)',
      borderLeft: '1px solid var(--border-medium)',
      boxShadow: 'var(--shadow-lg)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      animation: 'slideUp 250ms ease-out'
    }}>
      {/* Header */}
      <div style={{
        padding: '1.25rem 1.5rem',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--accent-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff'
          }}>
            <Sparkles size={16} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>AI Writing Assistant</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Modular smart editorial copilot</span>
          </div>
        </div>
        <button onClick={onClose} className="btn btn-ghost btn-icon">
          <X size={18} />
        </button>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        padding: '0.5rem 1rem',
        borderBottom: '1px solid var(--border-subtle)',
        gap: '0.35rem',
        overflowX: 'auto'
      }}>
        <button
          onClick={() => setActiveTab('titles')}
          className={`btn btn-sm ${activeTab === 'titles' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ fontSize: '0.75rem' }}
        >
          Titles
        </button>
        <button
          onClick={() => setActiveTab('tags')}
          className={`btn btn-sm ${activeTab === 'tags' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ fontSize: '0.75rem' }}
        >
          Tags
        </button>
        <button
          onClick={() => setActiveTab('summary')}
          className={`btn btn-sm ${activeTab === 'summary' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ fontSize: '0.75rem' }}
        >
          Summary
        </button>
        <button
          onClick={() => setActiveTab('category')}
          className={`btn btn-sm ${activeTab === 'category' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ fontSize: '0.75rem' }}
        >
          Classify
        </button>
        <button
          onClick={() => setActiveTab('improve')}
          className={`btn btn-sm ${activeTab === 'improve' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ fontSize: '0.75rem' }}
        >
          Polish
        </button>
      </div>

      {/* Drawer Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
        
        {/* TITLES TAB */}
        {activeTab === 'titles' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Generate engaging, SEO-optimized headlines based on your draft content.
              </p>
            </div>
            <button
              onClick={handleGenerateTitles}
              disabled={loading}
              className="btn btn-gradient btn-sm"
              style={{ width: '100%', marginBottom: '1.25rem' }}
            >
              <Wand2 size={14} /> {loading ? 'Analyzing...' : 'Generate 5 Titles'}
            </button>

            {generatedTitles.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {generatedTitles.map((t, idx) => (
                  <div
                    key={idx}
                    className="glass-panel"
                    style={{ padding: '0.85rem', cursor: 'pointer', transition: 'border-color var(--transition-fast)' }}
                    onClick={() => { onApplyTitle(t); showToast('Title applied!', 'success'); }}
                  >
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                      {t}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '2px', fontWeight: 600 }}>
                        Apply <ArrowRight size={11} />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAGS TAB */}
        {activeTab === 'tags' && (
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Extract key topics and suggest relevant trending tags for discovery.
            </p>
            <button
              onClick={handleSuggestTags}
              disabled={loading}
              className="btn btn-gradient btn-sm"
              style={{ width: '100%', marginBottom: '1.25rem' }}
            >
              <Tag size={14} /> {loading ? 'Extracting...' : 'Suggest Relevant Tags'}
            </button>

            {suggestedTags.length > 0 && (
              <div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                  {suggestedTags.map((tag, idx) => (
                    <span key={idx} className="badge badge-primary" style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem' }}>
                      #{tag}
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => { onApplyTags(suggestedTags); showToast('Tags applied to post!', 'success'); }}
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%' }}
                >
                  <Check size={14} /> Apply All Tags
                </button>
              </div>
            )}
          </div>
        )}

        {/* SUMMARY TAB */}
        {activeTab === 'summary' && (
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Synthesize your article into an impactful excerpt and social teaser.
            </p>
            <button
              onClick={handleGenerateSummary}
              disabled={loading}
              className="btn btn-gradient btn-sm"
              style={{ width: '100%', marginBottom: '1.25rem' }}
            >
              <FileText size={14} /> {loading ? 'Synthesizing...' : 'Generate Executive Summary'}
            </button>

            {generatedSummary && (
              <div className="glass-panel" style={{ padding: '1rem' }}>
                <div style={{ fontSize: '0.85rem', lineHeight: 1.6, color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  {generatedSummary}
                </div>
                <button
                  onClick={() => { onApplySummary(generatedSummary); showToast('Summary applied as excerpt!', 'success'); }}
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%' }}
                >
                  <Check size={14} /> Apply to Excerpt
                </button>
              </div>
            )}
          </div>
        )}

        {/* CATEGORY TAB */}
        {activeTab === 'category' && (
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Automatically predict the optimal category based on content semantics.
            </p>
            <button
              onClick={handleClassifyCategory}
              disabled={loading}
              className="btn btn-gradient btn-sm"
              style={{ width: '100%', marginBottom: '1.25rem' }}
            >
              <FolderTree size={14} /> {loading ? 'Classifying...' : 'Classify Content'}
            </button>

            {categoryPrediction && (
              <div className="glass-panel" style={{ padding: '1rem' }}>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                  Predicted Category
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-primary)', margin: '0.35rem 0' }}>
                  {categoryPrediction.category_name}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  Confidence: {Math.round(categoryPrediction.confidence * 100)}%
                </div>
                <button
                  onClick={() => { onApplyCategory(categoryPrediction.category_id); showToast(`Category set to ${categoryPrediction.category_name}`, 'success'); }}
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%' }}
                >
                  <Check size={14} /> Assign Category
                </button>
              </div>
            )}
          </div>
        )}

        {/* POLISH TAB */}
        {activeTab === 'improve' && (
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Refine grammar, active voice, and professional engineering cadence.
            </p>
            <button
              onClick={handleImproveWriting}
              disabled={loading}
              className="btn btn-gradient btn-sm"
              style={{ width: '100%', marginBottom: '1.25rem' }}
            >
              <Sparkles size={14} /> {loading ? 'Polishing...' : 'Polish Tone & Cadence'}
            </button>

            {improvedContent && (
              <div className="glass-panel" style={{ padding: '1rem' }}>
                <div style={{ fontSize: '0.85rem', maxHeight: '200px', overflowY: 'auto', lineHeight: 1.6, color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  {improvedContent}
                </div>
                <button
                  onClick={() => { onApplyImprovedContent(improvedContent); showToast('Content upgraded!', 'success'); }}
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%' }}
                >
                  <Check size={14} /> Replace With Polished Text
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
