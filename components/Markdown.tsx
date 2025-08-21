'use client'
import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function Markdown({ children }: { children: string }) {
  // GFM = headings, tables, lists, fenced code blocks, etc.
  return (
    <div className="md-content">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {children || ''}
      </ReactMarkdown>
    </div>
  )
}
