import React, { useState } from 'react'
import { Copy, Check, Terminal, ExternalLink } from 'lucide-react'

// Helper to parse inline markdown (bold, italic, inline code, links)
function parseInline(text) {
  if (!text) return text

  // Split tokens by regex
  const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`|\[.*?\]\(.*?\))/g
  const parts = text.split(regex)

  return parts.map((part, index) => {
    if (!part) return null

    // Bold **text**
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return <strong key={index} style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{part.slice(2, -2)}</strong>
    }

    // Italic *text*
    if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
      return <em key={index} style={{ fontStyle: 'italic' }}>{part.slice(1, -1)}</em>
    }

    // Inline code `code`
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      return (
        <code
          key={index}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.88em',
            background: 'var(--bg-card-secondary)',
            color: 'var(--accent-primary)',
            padding: '0.15rem 0.45rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            wordBreak: 'break-word'
          }}
        >
          {part.slice(1, -1)}
        </code>
      )
    }

    // Link [text](url)
    const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/)
    if (linkMatch) {
      const [, label, href] = linkMatch
      const isExternal = href.startsWith('http')
      return (
        <a
          key={index}
          href={href}
          target={isExternal ? '_blank' : '_self'}
          rel={isExternal ? 'noopener noreferrer' : ''}
          style={{
            color: 'var(--accent-primary)',
            textDecoration: 'underline',
            textUnderlineOffset: '3px',
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.2rem'
          }}
        >
          {label}
          {isExternal && <ExternalLink size={12} />}
        </a>
      )
    }

    return part
  })
}

// Code Block with Copy Button
function CodeBlock({ code, language }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{
      margin: '1.75rem 0',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      border: '1px solid var(--border-medium)',
      background: '#0d1117',
      boxShadow: 'var(--shadow-md)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.55rem 1rem',
        background: '#161b22',
        borderBottom: '1px solid #30363d',
        color: '#8b949e',
        fontSize: '0.78rem',
        fontFamily: 'var(--font-mono)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <Terminal size={14} style={{ color: 'var(--accent-primary)' }} />
          <span style={{ textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>
            {language || 'code'}
          </span>
        </div>
        <button
          onClick={handleCopy}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            background: 'transparent',
            border: 'none',
            color: copied ? '#3fb950' : '#8b949e',
            cursor: 'pointer',
            fontSize: '0.75rem',
            padding: '0.2rem 0.5rem',
            borderRadius: '4px',
            transition: 'all 0.2s'
          }}
          title="Copy code"
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <pre style={{
        margin: 0,
        padding: '1.25rem 1.25rem',
        overflowX: 'auto',
        fontSize: '0.9rem',
        lineHeight: 1.6,
        color: '#e6edf3',
        fontFamily: 'var(--font-mono)'
      }}>
        <code>{code}</code>
      </pre>
    </div>
  )
}

export default function MarkdownRenderer({ content }) {
  if (!content) return null

  // Split into lines to parse blocks
  const lines = content.split('\n')
  const elements = []

  let inCodeBlock = false
  let codeBuffer = []
  let codeLang = ''

  let listBuffer = []
  let isNumberedList = false

  const flushList = (keyPrefix) => {
    if (listBuffer.length > 0) {
      if (isNumberedList) {
        elements.push(
          <ol key={`${keyPrefix}-ol`} style={{ margin: '1rem 0 1.25rem 1.5rem', paddingLeft: '1rem', lineHeight: 1.8 }}>
            {listBuffer.map((item, i) => (
              <li key={i} style={{ marginBottom: '0.4rem' }}>{parseInline(item)}</li>
            ))}
          </ol>
        )
      } else {
        elements.push(
          <ul key={`${keyPrefix}-ul`} style={{ margin: '1rem 0 1.25rem 1.5rem', paddingLeft: '1rem', lineHeight: 1.8 }}>
            {listBuffer.map((item, i) => (
              <li key={i} style={{ marginBottom: '0.4rem' }}>{parseInline(item)}</li>
            ))}
          </ul>
        )
      }
      listBuffer = []
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Code block delimiters
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        // Close code block
        elements.push(
          <CodeBlock
            key={`code-${i}`}
            code={codeBuffer.join('\n')}
            language={codeLang}
          />
        )
        codeBuffer = []
        codeLang = ''
        inCodeBlock = false
      } else {
        flushList(`before-code-${i}`)
        inCodeBlock = true
        codeLang = line.trim().slice(3).trim()
      }
      continue
    }

    if (inCodeBlock) {
      codeBuffer.push(line)
      continue
    }

    // Horizontal Rule
    if (/^(\*\*\*|---|___)$/.test(line.trim())) {
      flushList(`hr-${i}`)
      elements.push(
        <hr
          key={`hr-${i}`}
          style={{
            border: 'none',
            borderTop: '1px solid var(--border-medium)',
            margin: '2.5rem 0',
            opacity: 0.6
          }}
        />
      )
      continue
    }

    // Headings
    if (line.startsWith('# ')) {
      flushList(`h1-${i}`)
      elements.push(
        <h1
          key={`h1-${i}`}
          style={{
            fontSize: '2.1rem',
            fontWeight: 800,
            marginTop: '2.5rem',
            marginBottom: '1.25rem',
            letterSpacing: '-0.03em',
            color: 'var(--text-primary)'
          }}
        >
          {parseInline(line.slice(2))}
        </h1>
      )
      continue
    }

    if (line.startsWith('## ')) {
      flushList(`h2-${i}`)
      elements.push(
        <h2
          key={`h2-${i}`}
          style={{
            fontSize: '1.6rem',
            fontWeight: 700,
            marginTop: '2.25rem',
            marginBottom: '1rem',
            letterSpacing: '-0.02em',
            color: 'var(--text-primary)',
            paddingBottom: '0.4rem',
            borderBottom: '1px solid var(--border-subtle)'
          }}
        >
          {parseInline(line.slice(3))}
        </h2>
      )
      continue
    }

    if (line.startsWith('### ')) {
      flushList(`h3-${i}`)
      elements.push(
        <h3
          key={`h3-${i}`}
          style={{
            fontSize: '1.3rem',
            fontWeight: 700,
            marginTop: '1.75rem',
            marginBottom: '0.75rem',
            color: 'var(--text-primary)'
          }}
        >
          {parseInline(line.slice(4))}
        </h3>
      )
      continue
    }

    // Blockquote
    if (line.startsWith('> ')) {
      flushList(`bq-${i}`)
      elements.push(
        <blockquote
          key={`bq-${i}`}
          style={{
            margin: '1.25rem 0',
            padding: '0.85rem 1.25rem',
            borderLeft: '4px solid var(--accent-primary)',
            background: 'var(--bg-glass-elevated)',
            borderRadius: '0 var(--radius-md) var(--radius-md) 0',
            fontStyle: 'italic',
            color: 'var(--text-secondary)'
          }}
        >
          {parseInline(line.slice(2))}
        </blockquote>
      )
      continue
    }

    // Unordered List (- or *)
    const ulMatch = line.match(/^(\*|-)\s+(.*)$/)
    if (ulMatch) {
      if (isNumberedList) flushList(`switch-list-${i}`)
      isNumberedList = false
      listBuffer.push(ulMatch[2])
      continue
    }

    // Ordered List (1. )
    const olMatch = line.match(/^(\d+)\.\s+(.*)$/)
    if (olMatch) {
      if (!isNumberedList) flushList(`switch-list-${i}`)
      isNumberedList = true
      listBuffer.push(olMatch[2])
      continue
    }

    // Normal line or empty line
    if (!line.trim()) {
      flushList(`empty-${i}`)
      continue
    }

    flushList(`p-${i}`)
    elements.push(
      <p
        key={`p-${i}`}
        style={{
          margin: '1.1rem 0',
          fontSize: '1.08rem',
          lineHeight: 1.85,
          color: 'var(--text-primary)',
          letterSpacing: '-0.01em'
        }}
      >
        {parseInline(line)}
      </p>
    )
  }

  // Flush remaining list items
  flushList('final')

  return (
    <div className="markdown-article-body" style={{ width: '100%' }}>
      {elements}
    </div>
  )
}
