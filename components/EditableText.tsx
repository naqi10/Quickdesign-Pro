'use client'
import { useEffect, useRef } from 'react'

interface EditableTextProps {
  // The current value from store
  value: string
  // ~~ separated path into ResumeData, e.g. "experience~~0~~bullets~~2"
  path: string
  // Called on blur with (path, newValue) when content changed
  onCommit: (path: string, value: string) => void
  // Which HTML tag to render as — preserves template layout exactly
  tag?: keyof React.JSX.IntrinsicElements
  className?: string
  style?: React.CSSProperties
}

/**
 * Renders any HTML tag as an inline-editable field.
 * - In preview: contentEditable, commits to store on blur
 * - Layout is completely unchanged — same tag, same class, same style
 * - Used only in browser preview. getResumeHTML calls templates with editable=false,
 *   so PDF output contains no contentEditable attributes.
 */
export default function EditableText({
  value,
  path,
  onCommit,
  tag,
  className,
  style,
}: EditableTextProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ref = useRef<any>(null)
  const tagName = tag ?? 'span'
  // Cast to a concrete HTML element type so TypeScript accepts the HTMLElement ref
  const DynamicTag = tagName as 'div'
  const isBlock = ['p', 'div', 'li', 'h1', 'h2', 'h3', 'h4'].includes(tagName)

  // Sync content from store → DOM only when not focused (e.g. after template switch)
  useEffect(() => {
    if (ref.current && document.activeElement !== ref.current) {
      if (ref.current.textContent !== value) {
        ref.current.textContent = value
      }
    }
  }, [value])

  // Set initial content on mount
  useEffect(() => {
    if (ref.current) {
      ref.current.textContent = value
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <DynamicTag
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      aria-multiline={isBlock}
      className={className}
      style={{
        ...style,
        display: isBlock ? 'block' : 'inline',
        outline: 'none',
        cursor: 'text',
        borderRadius: '2px',
        transition: 'background 0.15s',
        // inherit all font/color from parent — zero visual difference from a plain element
        font: 'inherit',
        color: 'inherit',
        letterSpacing: 'inherit',
        textAlign: 'inherit' as React.CSSProperties['textAlign'],
      }}
      onFocus={(e) => {
        e.currentTarget.style.background = 'rgba(59, 130, 246, 0.08)'
      }}
      onBlur={(e) => {
        e.currentTarget.style.background = ''
        const newValue = e.currentTarget.textContent ?? ''
        if (newValue !== value) {
          onCommit(path, newValue)
        }
      }}
      // Enter = commit (blur). Shift+Enter = allow newline in summaries/bullets
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault()
          e.currentTarget.blur()
        }
      }}
    />
  )
}
