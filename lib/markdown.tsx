import React from 'react'

/**
 * Simple markdown-like renderer for article content.
 * Supports: ## headings, **bold**, *italic*, ![alt](url) images, paragraphs, links.
 */
export function renderMarkdown(content: string): React.ReactNode[] {
  if (!content?.trim()) return []

  const lines = content.split('\n')
  const nodes: React.ReactNode[] = []
  let inParagraph = false
  let paragraphLines: string[] = []

  const flushParagraph = () => {
    if (paragraphLines.length > 0) {
      const text = paragraphLines.join(' ')
      nodes.push(
        <p key={nodes.length} className="mb-4 text-muted-foreground leading-relaxed">
          {parseInline(text)}
        </p>
      )
      paragraphLines = []
    }
    inParagraph = false
  }

  const parseInline = (text: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = []
    let remaining = text

    while (remaining.length > 0) {
      const imgMatch = remaining.match(/!\[([^\]]*)\]\(([^)]+)\)/)
      const boldMatch = remaining.match(/\*\*([^*]+)\*\*/)
      const italicMatch = remaining.match(/\*([^*]+)\*/)
      const linkMatch = remaining.match(/\[([^\]]+)\]\(([^)]+)\)/)

      let match: RegExpMatchArray | null = null
      let type = ''
      if (imgMatch && (imgMatch.index ?? 0) === 0) {
        match = imgMatch
        type = 'img'
      } else if (boldMatch && (boldMatch.index ?? 0) === 0) {
        match = boldMatch
        type = 'bold'
      } else if (italicMatch && (italicMatch.index ?? 0) === 0) {
        match = italicMatch
        type = 'italic'
      } else if (linkMatch && (linkMatch.index ?? 0) === 0) {
        match = linkMatch
        type = 'link'
      }

      if (match) {
        const before = remaining.slice(0, match.index)
        if (before) parts.push(before)
        if (type === 'img') {
          parts.push(
            <span key={parts.length} className="block my-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={match[2]} alt={match[1] || ''} className="w-full rounded-xl shadow-md object-cover max-h-[360px]" />
              {match[1] && <span className="block mt-1 text-sm text-muted-foreground text-center">{match[1]}</span>}
            </span>
          )
        } else if (type === 'bold') {
          parts.push(<strong key={parts.length}>{match[1]}</strong>)
        } else if (type === 'italic') {
          parts.push(<em key={parts.length}>{match[1]}</em>)
        } else if (type === 'link') {
          parts.push(
            <a key={parts.length} href={match[2]} className="text-primary hover:underline font-medium" target="_blank" rel="noopener noreferrer">
              {match[1]}
            </a>
          )
        }
        remaining = remaining.slice((match.index ?? 0) + match[0].length)
      } else {
        parts.push(remaining)
        break
      }
    }

    return parts
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    if (trimmed.startsWith('## ')) {
      flushParagraph()
      nodes.push(
        <h2 key={nodes.length} className="text-2xl font-bold text-foreground mt-10 mb-4 first:mt-0">
          {trimmed.slice(3)}
        </h2>
      )
    } else if (trimmed.startsWith('### ')) {
      flushParagraph()
      nodes.push(
        <h3 key={nodes.length} className="text-xl font-semibold text-foreground mt-8 mb-3">
          {trimmed.slice(4)}
        </h3>
      )
    } else if (trimmed.startsWith('- ')) {
      flushParagraph()
      const listItems = [trimmed.slice(2)]
      while (i + 1 < lines.length && lines[i + 1].trim().startsWith('- ')) {
        i++
        listItems.push(lines[i].trim().slice(2))
      }
      nodes.push(
        <ul key={nodes.length} className="list-disc list-inside mb-4 space-y-1 text-muted-foreground">
          {listItems.map((item, j) => (
            <li key={j}>{parseInline(item)}</li>
          ))}
        </ul>
      )
    } else if (trimmed === '') {
      flushParagraph()
    } else if (/^!\[([^\]]*)\]\(([^)]+)\)$/.test(trimmed)) {
      flushParagraph()
      const m = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)$/)!
      nodes.push(
        <figure key={nodes.length} className="my-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={m[2]} alt={m[1] || ''} className="w-full rounded-2xl shadow-lg object-cover max-h-[480px]" />
          {m[1] && <figcaption className="mt-2 text-sm text-muted-foreground text-center">{m[1]}</figcaption>}
        </figure>
      )
    } else {
      inParagraph = true
      paragraphLines.push(trimmed)
    }
  }
  flushParagraph()

  return nodes
}
