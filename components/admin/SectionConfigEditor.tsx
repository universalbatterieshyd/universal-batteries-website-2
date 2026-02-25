'use client'

import { useState } from 'react'
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

type Section = {
  id: string
  section_key: string
  config?: Record<string, unknown> | null
  label?: string
}

const ICON_OPTIONS = ['Shield', 'Truck', 'Award', 'Headphones', 'ThumbsUp', 'Clock', 'Zap', 'Battery', 'Car', 'Sun']

export function SectionConfigEditor({
  section,
  open,
  onOpenChange,
  onSave,
}: {
  section: Section | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (id: string, config: Record<string, unknown>) => Promise<void>
}) {
  const [form, setForm] = useState<Record<string, unknown>>({})
  const [saving, setSaving] = useState(false)

  if (!section) return null

  const config = (section.config || {}) as Record<string, unknown>
  const key = section.section_key

  const openEditor = () => {
    setForm({ ...config })
  }

  const handleOpenChange = (v: boolean) => {
    if (v) openEditor()
    onOpenChange(v)
  }

  const handleSubmit = async () => {
    setSaving(true)
    try {
      await onSave(section.id, form)
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  const canEdit = ['features_grid', 'image_text', 'faq', 'cta_banner'].includes(key)

  if (!canEdit) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit {section.label ?? section.section_key}</DialogTitle>
        </DialogHeader>

        {key === 'features_grid' && (
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                value={(form.title as string) ?? ''}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Why Choose Us"
              />
            </div>
            <div>
              <Label>Subtitle</Label>
              <Input
                value={(form.subtitle as string) ?? ''}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                placeholder="Your trusted partner"
              />
            </div>
            <div>
              <Label>Features (one per line: icon|title|description)</Label>
              <Textarea
                value={((form.features as { icon: string; title: string; description: string }[]) ?? [])
                  .map((f) => `${f.icon}|${f.title}|${f.description}`)
                  .join('\n')}
                onChange={(e) => {
                  const lines = e.target.value.split('\n').filter(Boolean)
                  const features = lines.map((line) => {
                    const [icon, title, description] = line.split('|')
                    return {
                      icon: (icon ?? 'Shield').trim(),
                      title: (title ?? '').trim(),
                      description: (description ?? '').trim(),
                    }
                  })
                  setForm({ ...form, features })
                }}
                rows={6}
                placeholder="Shield|Genuine Products|100% authentic"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Icons: {ICON_OPTIONS.join(', ')}
              </p>
            </div>
          </div>
        )}

        {key === 'image_text' && (
          <div className="space-y-4">
            <div>
              <Label>Image URL</Label>
              <Input
                value={(form.imageUrl as string) ?? ''}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="/placeholder.svg"
              />
            </div>
            <div>
              <Label>Heading</Label>
              <Input
                value={(form.heading as string) ?? ''}
                onChange={(e) => setForm({ ...form, heading: e.target.value })}
                placeholder="Quality & Service"
              />
            </div>
            <div>
              <Label>Body</Label>
              <Textarea
                value={(form.body as string) ?? ''}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                rows={3}
                placeholder="We deliver genuine products..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>CTA Text</Label>
                <Input
                  value={(form.ctaText as string) ?? ''}
                  onChange={(e) => setForm({ ...form, ctaText: e.target.value })}
                  placeholder="Learn More"
                />
              </div>
              <div>
                <Label>CTA Link</Label>
                <Input
                  value={(form.ctaLink as string) ?? ''}
                  onChange={(e) => setForm({ ...form, ctaLink: e.target.value })}
                  placeholder="# or https://"
                />
              </div>
            </div>
            <div>
              <Label>Image Position</Label>
              <select
                value={(form.imagePosition as string) ?? 'right'}
                onChange={(e) => setForm({ ...form, imagePosition: e.target.value })}
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="left">Left</option>
                <option value="right">Right</option>
              </select>
            </div>
          </div>
        )}

        {key === 'faq' && (
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                value={(form.title as string) ?? ''}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="FAQ"
              />
            </div>
            <div>
              <Label>Subtitle</Label>
              <Input
                value={(form.subtitle as string) ?? ''}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                placeholder="Common questions"
              />
            </div>
            <div>
              <Label>Q&A (one per line: Question?|Answer)</Label>
              <Textarea
                value={((form.items as { question: string; answer: string }[]) ?? [])
                  .map((i) => `${i.question}|${i.answer}`)
                  .join('\n')}
                onChange={(e) => {
                  const lines = e.target.value.split('\n').filter(Boolean)
                  const items = lines.map((line) => {
                    const sep = line.indexOf('|')
                    const q = sep >= 0 ? line.slice(0, sep).trim() : line
                    const a = sep >= 0 ? line.slice(sep + 1).trim() : ''
                    return { question: q, answer: a }
                  })
                  setForm({ ...form, items })
                }}
                rows={8}
                placeholder="What types of batteries?|We offer automotive, inverter..."
              />
            </div>
          </div>
        )}

        {key === 'cta_banner' && (
          <div className="space-y-4">
            <div>
              <Label>Headline</Label>
              <Input
                value={(form.headline as string) ?? ''}
                onChange={(e) => setForm({ ...form, headline: e.target.value })}
                placeholder="Ready to Get Started?"
              />
            </div>
            <div>
              <Label>Subtext</Label>
              <Textarea
                value={(form.subtext as string) ?? ''}
                onChange={(e) => setForm({ ...form, subtext: e.target.value })}
                rows={2}
                placeholder="Contact us today."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Button Text</Label>
                <Input
                  value={(form.buttonText as string) ?? ''}
                  onChange={(e) => setForm({ ...form, buttonText: e.target.value })}
                  placeholder="Contact Us"
                />
              </div>
              <div>
                <Label>Button Link</Label>
                <Input
                  value={(form.buttonLink as string) ?? ''}
                  onChange={(e) => setForm({ ...form, buttonLink: e.target.value })}
                  placeholder="#contact"
                />
              </div>
            </div>
            <div>
              <Label>Variant</Label>
              <select
                value={(form.variant as string) ?? 'primary'}
                onChange={(e) => setForm({ ...form, variant: e.target.value })}
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="primary">Primary</option>
                <option value="secondary">Secondary</option>
              </select>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
