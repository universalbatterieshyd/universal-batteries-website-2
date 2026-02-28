'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Trash2 } from 'lucide-react'

type Block = {
  id?: string
  headline?: string
  subheadline?: string
  story?: string
  imageUrl?: string
  imageCaption?: string
  order?: number
}

export function AboutUsManager({ initialBlocks }: { initialBlocks: Block[] }) {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks)
  const [saving, setSaving] = useState(false)

  const addBlock = () => {
    setBlocks((prev) => [
      ...prev,
      { headline: '', subheadline: '', story: '', imageUrl: '', imageCaption: '', order: prev.length },
    ])
  }

  const removeBlock = (index: number) => {
    setBlocks((prev) => prev.filter((_, i) => i !== index))
  }

  const updateBlock = (index: number, field: keyof Block, value: string) => {
    setBlocks((prev) =>
      prev.map((b, i) => (i === index ? { ...b, [field]: value } : b))
    )
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/about-us', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blocks: blocks.map((b, i) => ({
            ...b,
            order: i,
          })),
        }),
      })
      if (res.ok) {
        const updated = await res.json()
        setBlocks(updated)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <p className="text-sm text-slate-500">
        Add blocks for headline + story, or image + caption. Order determines display sequence.
      </p>
      {blocks.map((block, index) => (
        <div key={index} className="p-6 rounded-lg border border-slate-200 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Headline</Label>
              <Input
                value={block.headline || ''}
                onChange={(e) => updateBlock(index, 'headline', e.target.value)}
                placeholder="Our Story"
              />
            </div>
            <div>
              <Label>Subheadline</Label>
              <Input
                value={block.subheadline || ''}
                onChange={(e) => updateBlock(index, 'subheadline', e.target.value)}
                placeholder="A legacy since 1992"
              />
            </div>
          </div>
          <div>
            <Label>Story / Content</Label>
            <Textarea
              value={block.story || ''}
              onChange={(e) => updateBlock(index, 'story', e.target.value)}
              rows={4}
              placeholder="Tell your story..."
            />
          </div>
          <div>
            <Label>Image URL</Label>
            <Input
              value={block.imageUrl || ''}
              onChange={(e) => updateBlock(index, 'imageUrl', e.target.value)}
              placeholder="https://..."
            />
            <p className="text-xs text-slate-500 mt-1">Recommended: 1200×800px or 16:9</p>
          </div>
          <div>
            <Label>Image caption</Label>
            <Input
              value={block.imageCaption || ''}
              onChange={(e) => updateBlock(index, 'imageCaption', e.target.value)}
              placeholder="Optional caption"
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => removeBlock(index)}
            className="text-red-600"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Remove block
          </Button>
        </div>
      ))}
      <div className="flex gap-4">
        <Button variant="outline" onClick={addBlock}>
          <Plus className="h-4 w-4 mr-2" />
          Add block
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </div>
  )
}
