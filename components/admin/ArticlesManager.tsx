'use client'

import { useState, useRef } from 'react'
import { Plus, Pencil, Trash2, ExternalLink, ImagePlus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ImageUploadField } from './ImageUploadField'

function ContentImageUpload({ onInsert }: { onInsert: (url: string, alt?: string) => void }) {
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'article')
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (res.ok && data.url) onInsert(data.url, file.name.replace(/\.[^.]+$/, ''))
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }
  return (
    <>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
      <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()} disabled={uploading}>
        <ImagePlus className="h-4 w-4 mr-2" />
        {uploading ? 'Uploading...' : 'Insert image'}
      </Button>
    </>
  )
}

type Article = {
  id: string
  slug: string
  title: string
  excerpt?: string | null
  content: string
  featuredImageUrl?: string | null
  isPublished: boolean
  createdAt?: string
  updatedAt?: string
}

export function ArticlesManager({ initialArticles }: { initialArticles: Article[] }) {
  const [articles, setArticles] = useState(initialArticles)
  const [editing, setEditing] = useState<Article | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featuredImageUrl: '',
    isPublished: true,
  })

  const resetForm = () => {
    setForm({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      featuredImageUrl: '',
      isPublished: true,
    })
    setEditing(null)
    setCreating(false)
  }

  const populateForm = (a: Article) => {
    setForm({
      title: a.title,
      slug: a.slug,
      excerpt: a.excerpt || '',
      content: a.content || '',
      featuredImageUrl: a.featuredImageUrl || '',
      isPublished: a.isPublished ?? true,
    })
    setEditing(a)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) return
    const slug = form.slug.trim() || form.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

    try {
      if (editing) {
        const res = await fetch(`/api/articles/${editing.slug}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: form.title.trim(),
            slug,
            excerpt: form.excerpt.trim() || null,
            content: form.content.trim() || '',
            featuredImageUrl: form.featuredImageUrl.trim() || null,
            isPublished: form.isPublished,
          }),
        })
        if (res.ok) {
          const updated = await res.json()
          setArticles((prev) => prev.map((a) => (a.id === editing.id ? updated : a)))
          resetForm()
        }
      } else {
        const res = await fetch('/api/articles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: form.title.trim(),
            slug,
            excerpt: form.excerpt.trim() || null,
            content: form.content.trim() || '',
            featuredImageUrl: form.featuredImageUrl.trim() || null,
            isPublished: form.isPublished,
          }),
        })
        if (res.ok) {
          const created = await res.json()
          setArticles((prev) => [...prev, created])
          resetForm()
        }
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (a: Article) => {
    if (!confirm(`Delete article "${a.title}"?`)) return
    const res = await fetch(`/api/articles/${a.slug}`, { method: 'DELETE' })
    if (res.ok) {
      setArticles((prev) => prev.filter((x) => x.id !== a.id))
      if (editing?.id === a.id) resetForm()
    }
  }

  const isFormOpen = Boolean(editing || creating)

  return (
    <div className="space-y-6">
      <Button onClick={() => { resetForm(); setCreating(true) }}>
        <Plus className="w-4 h-4 mr-2" />
        Add Article
      </Button>

      <div className="rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left p-4 font-medium text-slate-700">Title</th>
              <th className="text-left p-4 font-medium text-slate-700">Slug</th>
              <th className="text-left p-4 font-medium text-slate-700 w-24">Status</th>
              <th className="text-left p-4 font-medium text-slate-700 w-28">Actions</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((a) => (
              <tr key={a.id} className="border-t border-slate-200 hover:bg-slate-50/50">
                <td className="p-4 font-medium">{a.title}</td>
                <td className="p-4 text-slate-500">{a.slug}</td>
                <td className="p-4">
                  <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${a.isPublished ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'}`}>
                    {a.isPublished ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <a href={`/articles/${a.slug}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded hover:bg-slate-200 text-slate-600" title="View">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                    <button type="button" onClick={() => populateForm(a)} className="p-2 rounded hover:bg-slate-200 text-slate-600">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => handleDelete(a)} className="p-2 rounded hover:bg-red-100 text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {articles.length === 0 && (
        <p className="text-slate-500 py-8 text-center">No articles yet. Create one to link from FAQs.</p>
      )}

      <Dialog open={isFormOpen} onOpenChange={(open) => { if (!open) resetForm() }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit article' : 'New article'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Title *</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, slug: form.slug || e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') })} placeholder="How to choose the right battery" />
              </div>
              <div>
                <Label>Slug (URL)</Label>
                <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="choose-right-battery" />
              </div>
            </div>
            <div>
              <Label>Excerpt (optional)</Label>
              <Input value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} placeholder="Short summary for links" />
            </div>
            <div>
              <Label>Featured image</Label>
              <ImageUploadField value={form.featuredImageUrl} onChange={(v) => setForm({ ...form, featuredImageUrl: v })} type="article" placeholder="Upload or paste URL" previewSize="lg" />
            </div>
            <div>
              <Label>Content (Markdown)</Label>
              <div className="flex gap-2 mb-2">
                <ContentImageUpload onInsert={(url, alt) => {
                  const md = alt ? `![${alt}](${url})` : `![](${url})`
                  setForm((f) => ({ ...f, content: f.content + (f.content ? '\n\n' : '') + md }))
                }} />
              </div>
              <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={12} className="font-mono text-sm" placeholder="## Heading&#10;&#10;Paragraph text.&#10;&#10;![Image alt](/path/to/image.jpg)" />
              <p className="text-xs text-slate-500 mt-1.5">Use markdown: ## for headings, **bold**, ![alt](url) for images. Use the button above to upload and insert images.</p>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="is_published" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} className="rounded border-slate-300" />
              <Label htmlFor="is_published">Published (visible on site)</Label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
              <Button type="submit">{editing ? 'Save' : 'Create'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
