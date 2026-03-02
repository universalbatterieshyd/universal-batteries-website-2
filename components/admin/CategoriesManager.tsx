'use client'

import { useState, useEffect } from 'react'
import { FolderTree, Plus, Pencil, Trash2, ChevronDown, ChevronRight, GripVertical, FileText } from 'lucide-react'
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

const ICON_OPTIONS = ['Car', 'Zap', 'Server', 'Sun', 'Battery', 'Wrench', 'Shield', 'Truck']

type Category = {
  id: string
  name: string
  slug: string
  description?: string | null
  parentId?: string | null
  order?: number
  heroHeadline?: string | null
  heroTagline?: string | null
  heroImageUrl?: string | null
  cardImageUrl?: string | null
  overview?: string | null
  ctaHeadline?: string | null
  ctaSubtext?: string | null
  faqItems?: { question: string; answer: string; moreInfo?: string; articleSlug?: string }[]
  icon?: string | null
}

export function CategoriesManager() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Category | null>(null)
  const [creating, setCreating] = useState(false)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [articles, setArticles] = useState<{ slug: string; title: string }[]>([])
  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    parentId: '',
    heroHeadline: '',
    heroTagline: '',
    heroImageUrl: '',
    cardImageUrl: '',
    overview: '',
    ctaHeadline: '',
    ctaSubtext: '',
    faqItems: [] as { question: string; answer: string; moreInfo?: string; articleSlug?: string }[],
    icon: 'Car',
  })

  const loadCategories = async () => {
    try {
      const res = await fetch('/api/categories?all=true')
      const data = await res.json()
      if (res.ok && Array.isArray(data)) setCategories(data)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])

  const loadArticles = async () => {
    try {
      const res = await fetch('/api/articles?all=true')
      const data = await res.json()
      if (res.ok && Array.isArray(data)) {
        setArticles(data.map((a: { slug?: string; title?: string }) => ({ slug: a.slug ?? '', title: a.title ?? '' })))
      } else {
        setArticles([])
      }
    } catch {
      setArticles([])
    }
  }

  useEffect(() => {
    if (editing || creating) loadArticles()
  }, [editing, creating])

  const topLevel = categories.filter((c) => !c.parentId)
  const getSubcategories = (parentId: string) =>
    categories.filter((c) => c.parentId === parentId)

  const resetForm = () => {
    setForm({
      name: '',
      slug: '',
      description: '',
      parentId: '',
      heroHeadline: '',
      heroTagline: '',
      heroImageUrl: '',
      cardImageUrl: '',
      overview: '',
      ctaHeadline: '',
      ctaSubtext: '',
      faqItems: [],
      icon: 'Car',
    })
    setEditing(null)
    setCreating(false)
  }

  const populateForm = (c: Category) => {
    setForm({
      name: c.name,
      slug: c.slug,
      description: c.description || '',
      parentId: c.parentId || '',
      heroHeadline: c.heroHeadline || '',
      heroTagline: c.heroTagline || '',
      heroImageUrl: c.heroImageUrl || '',
      cardImageUrl: c.cardImageUrl || '',
      overview: c.overview || '',
      ctaHeadline: c.ctaHeadline || '',
      ctaSubtext: c.ctaSubtext || '',
      faqItems: (c.faqItems || []).map((i) => ({
        question: i.question || '',
        answer: i.answer || '',
        moreInfo: i.moreInfo || '',
        articleSlug: i.articleSlug || '',
      })),
      icon: c.icon || 'Car',
    })
    setEditing(c)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return
    const slug = form.slug || form.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    const faqItems = form.faqItems
      .split('\n')
      .filter(Boolean)
      .map((line) => {
        const pipeIdx = line.indexOf('|')
        const rest = pipeIdx >= 0 ? line.slice(pipeIdx + 1) : ''
        const doublePipeIdx = rest.indexOf('||')
        const answer = doublePipeIdx >= 0 ? rest.slice(0, doublePipeIdx).trim() : rest.trim()
        const moreInfo = doublePipeIdx >= 0 ? rest.slice(doublePipeIdx + 2).trim() : undefined
        return {
          question: pipeIdx >= 0 ? line.slice(0, pipeIdx).trim() : line,
          answer,
          ...(moreInfo ? { moreInfo } : {}),
        }
      })

    const payload = {
      name: form.name.trim(),
      slug,
      description: form.description || null,
      parentId: form.parentId || null,
      heroHeadline: form.heroHeadline || null,
      heroTagline: form.heroTagline || null,
      heroImageUrl: form.heroImageUrl || null,
      cardImageUrl: form.cardImageUrl || null,
      overview: form.overview || null,
      ctaHeadline: form.ctaHeadline || null,
      ctaSubtext: form.ctaSubtext || null,
      faqItems,
      icon: form.icon,
    }

    try {
      if (editing) {
        const res = await fetch(`/api/categories/${editing.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (res.ok) {
          const updated = await res.json()
          setCategories((prev) => prev.map((c) => (c.id === editing.id ? updated : c)))
          resetForm()
        }
      } else {
        const res = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, order: categories.length }),
        })
        if (res.ok) {
          const created = await res.json()
          setCategories((prev) => [...prev, created])
          resetForm()
          loadCategories()
        }
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category? Products in it will need to be reassigned.')) return
    const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setCategories((prev) => prev.filter((c) => c.id !== id))
      resetForm()
    }
  }

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  if (loading) return <p className="text-slate-500">Loading...</p>

  const isFormOpen = Boolean(editing || creating)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          onClick={() => {
            resetForm()
            setCreating(true)
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add category
        </Button>
      </div>

      <div className="rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left p-4 font-medium text-slate-700">Name</th>
              <th className="text-left p-4 font-medium text-slate-700">Slug</th>
              <th className="text-left p-4 font-medium text-slate-700 w-24">Actions</th>
            </tr>
          </thead>
          <tbody>
            {topLevel.map((cat) => {
              const subcats = getSubcategories(cat.id)
              const hasSubs = subcats.length > 0
              const isExp = expanded.has(cat.id)
              return (
                <tbody key={cat.id}>
                  <tr className="border-t border-slate-200 hover:bg-slate-50/50">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => hasSubs && toggleExpand(cat.id)}
                          className="p-0.5"
                        >
                          {hasSubs ? (
                            isExp ? (
                              <ChevronDown className="h-4 w-4 text-slate-400" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-slate-400" />
                            )
                          ) : (
                            <span className="w-4 inline-block" />
                          )}
                        </button>
                        <FolderTree className="h-4 w-4 text-slate-400" />
                        <span className="font-medium">{cat.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-500">{cat.slug}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => populateForm(cat)}
                          className="p-2 rounded hover:bg-slate-200 text-slate-600"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(cat.id)}
                          className="p-2 rounded hover:bg-red-100 text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {hasSubs && isExp &&
                    subcats.map((sub) => (
                      <tr key={sub.id} className="border-t border-slate-100 bg-slate-50/30">
                        <td className="p-4 pl-12">
                          <span className="text-slate-600">{sub.name}</span>
                          <span className="ml-2 text-xs text-slate-400">(sub)</span>
                        </td>
                        <td className="p-4 text-slate-500">{sub.slug}</td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => populateForm(sub)}
                              className="p-2 rounded hover:bg-slate-200 text-slate-600"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(sub.id)}
                              className="p-2 rounded hover:bg-red-100 text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              )
            })}
          </tbody>
        </table>
      </div>

      {topLevel.length > 0 && (
        <Button
          variant="outline"
          onClick={() => {
            resetForm()
            setForm({
              name: '',
              slug: '',
              description: '',
              parentId: topLevel[0]?.id || '',
              heroHeadline: '',
              heroTagline: '',
              heroImageUrl: '',
              cardImageUrl: '',
              overview: '',
              ctaHeadline: '',
              ctaSubtext: '',
              faqItems: [],
              icon: 'Car',
            })
            setCreating(true)
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add subcategory
        </Button>
      )}

      <Dialog open={isFormOpen} onOpenChange={(open) => { if (!open) resetForm() }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit category' : 'New category'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                      slug: form.slug || e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
                    })
                  }
                  placeholder="Automotive Batteries"
                />
              </div>
              <div>
                <Label>Slug</Label>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="automotive"
                />
              </div>
            </div>
            <div>
              <Label>Parent (for subcategory)</Label>
              <select
                value={form.parentId}
                onChange={(e) => setForm({ ...form, parentId: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="">— Top-level —</option>
                {topLevel.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Short description</Label>
              <Input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Premium car, truck, and commercial vehicle batteries"
              />
            </div>
            <div>
              <Label>Icon</Label>
              <select
                value={form.icon}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              >
                {ICON_OPTIONS.map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
            </div>
            <hr />
            <h4 className="font-medium">Category page content</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Hero headline</Label>
                <Input
                  value={form.heroHeadline}
                  onChange={(e) => setForm({ ...form, heroHeadline: e.target.value })}
                  placeholder="Automotive Batteries"
                />
              </div>
              <div>
                <Label>Hero tagline</Label>
                <Input
                  value={form.heroTagline}
                  onChange={(e) => setForm({ ...form, heroTagline: e.target.value })}
                  placeholder="Premium power for every vehicle"
                />
              </div>
            </div>
            <div>
              <Label>Hero banner image URL</Label>
              <Input
                value={form.heroImageUrl}
                onChange={(e) => setForm({ ...form, heroImageUrl: e.target.value })}
                placeholder="https://... (leave empty for gradient)"
              />
              <p className="text-xs text-slate-500 mt-1.5">
                Desktop: 1920×600px (16:5). Mobile: 800×600px or 1200×600px. Use landscape, high-res JPG/WebP.
              </p>
            </div>
            <div>
              <Label>Homepage card image (640×400px)</Label>
              <ImageUploadField
                value={form.cardImageUrl}
                onChange={(v) => setForm({ ...form, cardImageUrl: v })}
                type="category"
                placeholder="Upload or paste URL"
                previewSize="md"
              />
              <p className="text-xs text-slate-500 mt-1.5">
                Shown on homepage. 640×400px recommended—sharp on retina, ~100–150KB when compressed.
              </p>
            </div>
            <div>
              <Label>Overview (main content)</Label>
              <Textarea
                value={form.overview}
                onChange={(e) => setForm({ ...form, overview: e.target.value })}
                rows={5}
                placeholder="Describe this category..."
              />
            </div>
            <div>
              <Label>CTA headline</Label>
              <Input
                value={form.ctaHeadline}
                onChange={(e) => setForm({ ...form, ctaHeadline: e.target.value })}
                placeholder="Need help choosing?"
              />
            </div>
            <div>
              <Label>CTA subtext</Label>
              <Input
                value={form.ctaSubtext}
                onChange={(e) => setForm({ ...form, ctaSubtext: e.target.value })}
                placeholder="Our team is ready to help."
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>FAQs</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setForm({ ...form, faqItems: [...form.faqItems, { question: '', answer: '', moreInfo: '', articleSlug: '' }] })}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add FAQ
                </Button>
              </div>
              <div className="space-y-4 max-h-[320px] overflow-y-auto pr-2">
                {form.faqItems.map((faq, idx) => (
                  <div key={idx} className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 space-y-3">
                    <div className="flex items-start gap-2">
                      <span className="mt-2.5 text-slate-400" aria-hidden><GripVertical className="h-4 w-4" /></span>
                      <div className="flex-1 space-y-2">
                        <Input
                          value={faq.question}
                          onChange={(e) => {
                            const next = [...form.faqItems]
                            next[idx] = { ...next[idx], question: e.target.value }
                            setForm({ ...form, faqItems: next })
                          }}
                          placeholder="Question"
                          className="font-medium"
                        />
                        <Textarea
                          value={faq.answer}
                          onChange={(e) => {
                            const next = [...form.faqItems]
                            next[idx] = { ...next[idx], answer: e.target.value }
                            setForm({ ...form, faqItems: next })
                          }}
                          placeholder="Answer"
                          rows={2}
                          className="text-sm"
                        />
                        <details className="group">
                          <summary className="cursor-pointer text-sm text-slate-500 hover:text-slate-700">Optional: More info (expandable on site)</summary>
                          <Textarea
                            value={faq.moreInfo || ''}
                            onChange={(e) => {
                              const next = [...form.faqItems]
                              next[idx] = { ...next[idx], moreInfo: e.target.value }
                              setForm({ ...form, faqItems: next })
                            }}
                            placeholder="Extra details shown when user clicks &quot;More info&quot;"
                            rows={2}
                            className="mt-2 text-sm"
                          />
                        </details>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-slate-400" />
                          <select
                            value={faq.articleSlug || ''}
                            onChange={(e) => {
                              const next = [...form.faqItems]
                              next[idx] = { ...next[idx], articleSlug: e.target.value }
                              setForm({ ...form, faqItems: next })
                            }}
                            className="flex-1 border rounded-lg px-3 py-2 text-sm"
                          >
                            <option value="">No linked article</option>
                            {(articles ?? []).map((a) => (
                              <option key={a.slug} value={a.slug}>{a.title}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 shrink-0"
                        onClick={() => setForm({ ...form, faqItems: form.faqItems.filter((_, i) => i !== idx) })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              {form.faqItems.length === 0 && (
                <p className="text-sm text-slate-500 py-4 text-center border border-dashed border-slate-200 rounded-lg">
                  No FAQs yet. Click &quot;Add FAQ&quot; to add one.
                </p>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button type="submit">{editing ? 'Save' : 'Create'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
