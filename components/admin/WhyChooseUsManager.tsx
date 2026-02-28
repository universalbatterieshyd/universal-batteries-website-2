'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Shield, Truck, Award, Headphones, ThumbsUp, Clock, Plus, Trash2 } from 'lucide-react'

const ICON_OPTIONS = [
  { value: 'Shield', label: 'Shield' },
  { value: 'Truck', label: 'Truck' },
  { value: 'Award', label: 'Award' },
  { value: 'Headphones', label: 'Headphones' },
  { value: 'ThumbsUp', label: 'ThumbsUp' },
  { value: 'Clock', label: 'Clock' },
]

type Item = { id?: string; title: string; description: string; icon: string; order?: number }

export function WhyChooseUsManager({ initialItems }: { initialItems: Item[] }) {
  const [items, setItems] = useState<Item[]>(initialItems)
  const [saving, setSaving] = useState(false)

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { title: '', description: '', icon: 'Shield', order: prev.length },
    ])
  }

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: keyof Item, value: string | number) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    )
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/why-choose-us', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item, i) => ({
            ...item,
            order: i,
          })),
        }),
      })
      if (res.ok) {
        const updated = await res.json()
        setItems(updated)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <p className="text-sm text-slate-500">
        Use 4 or 6 items for a symmetric grid (2×2 or 2×3). Drag to reorder by editing order.
      </p>
      {items.map((item, index) => (
        <div key={index} className="flex gap-4 p-4 rounded-lg border border-slate-200">
          <div className="flex-1 grid grid-cols-2 gap-4">
            <div>
              <Label>Title</Label>
              <Input
                value={item.title}
                onChange={(e) => updateItem(index, 'title', e.target.value)}
                placeholder="Genuine Products"
              />
            </div>
            <div>
              <Label>Icon</Label>
              <select
                value={item.icon}
                onChange={(e) => updateItem(index, 'icon', e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              >
                {ICON_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <Label>Description</Label>
              <Input
                value={item.description}
                onChange={(e) => updateItem(index, 'description', e.target.value)}
                placeholder="100% authentic batteries from authorized brands"
              />
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => removeItem(index)}
            className="text-red-600 shrink-0"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <div className="flex gap-4">
        <Button variant="outline" onClick={addItem}>
          <Plus className="h-4 w-4 mr-2" />
          Add USP
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </div>
  )
}
