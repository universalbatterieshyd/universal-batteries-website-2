'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import type { Appliance } from '@/app/admin/appliances/page'
import { ImageUploadField } from '@/components/admin/ImageUploadField'

export function AppliancesManager({ initialAppliances }: { initialAppliances: Appliance[] }) {
  const [appliances, setAppliances] = useState(initialAppliances)
  const [editing, setEditing] = useState<Appliance | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({
    key: '',
    name: '',
    watts: 0,
    emoji: '📦',
    iconUrl: '',
    showInVisual: true,
    order: 0,
  })
  const [error, setError] = useState('')

  const resetForm = () => {
    setForm({
      key: '',
      name: '',
      watts: 0,
      emoji: '📦',
      iconUrl: '',
      showInVisual: true,
      order: appliances.length,
    })
    setEditing(null)
    setCreating(false)
    setError('')
  }

  const handleEdit = (a: Appliance) => {
    setEditing(a)
    setCreating(false)
    setForm({
      key: a.key,
      name: a.name,
      watts: a.watts,
      emoji: a.emoji,
      iconUrl: a.iconUrl || '',
      showInVisual: a.showInVisual,
      order: a.order,
    })
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.key || !form.name || form.watts <= 0) return
    setError('')
    try {
      if (editing) {
        const res = await fetch(`/api/appliances/${editing.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        if (res.ok) {
          const updated = await res.json()
          setAppliances((prev) =>
            prev.map((a) =>
              a.id === editing.id
                ? {
                    ...a,
                    key: updated.key,
                    name: updated.name,
                    watts: updated.watts,
                    emoji: updated.emoji,
                    iconUrl: updated.iconUrl || null,
                    showInVisual: updated.showInVisual,
                    order: updated.order,
                  }
                : a
            )
          )
          resetForm()
        } else {
          const data = await res.json().catch(() => ({}))
          setError(data.error || 'Could not save appliance')
        }
      } else {
        const res = await fetch('/api/appliances', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        if (res.ok) {
          const created = await res.json()
          setAppliances((prev) => [
            ...prev,
            {
              id: created.id,
              key: created.key,
              name: created.name,
              watts: created.watts,
              emoji: created.emoji,
              iconUrl: created.iconUrl || null,
              showInVisual: created.showInVisual,
              order: created.order,
            },
          ])
          resetForm()
        } else {
          const data = await res.json().catch(() => ({}))
          setError(data.error || 'Could not add appliance')
        }
      }
    } catch (err) {
      console.error(err)
      setError('Something went wrong')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this appliance?')) return
    const res = await fetch(`/api/appliances/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setAppliances((prev) => prev.filter((a) => a.id !== id))
      if (editing?.id === id) resetForm()
    }
  }

  return (
    <div className="p-6 space-y-6">
      <button
        onClick={() => {
          resetForm()
          setForm((f) => ({ ...f, order: appliances.length }))
          setCreating(true)
        }}
        className="flex items-center gap-2 px-4 py-2 bg-[#E31B23] text-white rounded-lg hover:bg-[#C8161D]"
      >
        <Plus className="h-4 w-4" />
        Add appliance
      </button>

      {(creating || editing) && (
        <form onSubmit={handleSubmit} className="rounded-xl border p-6 space-y-4">
          <h3 className="font-semibold">{editing ? 'Edit appliance' : 'Add appliance'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Key (unique) *</label>
              <input
                type="text"
                value={form.key}
                onChange={(e) => setForm((f) => ({ ...f, key: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="e.g. led-light"
                required
                disabled={!!editing}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="e.g. LED Light"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Watts *</label>
              <input
                type="number"
                min={1}
                value={form.watts || ''}
                onChange={(e) => setForm((f) => ({ ...f, watts: parseInt(e.target.value, 10) || 0 }))}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="e.g. 20"
                required
              />
              <p className="mt-1 text-xs text-slate-500">Use a conservative running wattage (worst-case nameplate).</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Emoji fallback</label>
              <input
                type="text"
                value={form.emoji}
                onChange={(e) => setForm((f) => ({ ...f, emoji: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="💡"
              />
              <p className="mt-1 text-xs text-slate-500">Shown when no custom icon is uploaded.</p>
            </div>
            <div className="sm:col-span-2">
              <ImageUploadField
                type="appliance"
                label="Custom icon"
                value={form.iconUrl}
                onChange={(iconUrl) => setForm((f) => ({ ...f, iconUrl }))}
                placeholder="Upload a square PNG/SVG/WebP, or paste a URL"
                previewSize="sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showInVisual"
                checked={form.showInVisual}
                onChange={(e) => setForm((f) => ({ ...f, showInVisual: e.target.checked }))}
              />
              <label htmlFor="showInVisual">Show in calculator grid</label>
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-[#E31B23] text-white rounded-lg hover:bg-[#C8161D]"
            >
              {editing ? 'Save' : 'Add'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 border rounded-lg"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {appliances.map((a) => (
          <div
            key={a.id}
            className="flex items-center justify-between rounded-xl border p-4"
          >
            <div className="flex items-center gap-3 min-w-0">
              {a.iconUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={a.iconUrl} alt="" className="h-10 w-10 rounded-lg object-contain bg-slate-50" />
              ) : (
                <span className="text-2xl">{a.emoji}</span>
              )}
              <div className="min-w-0">
                <div className="font-medium truncate">{a.name}</div>
                <div className="text-sm text-slate-500">{a.watts}W · {a.key}</div>
              </div>
            </div>
            <div className="flex gap-1 shrink-0">
              <button
                onClick={() => handleEdit(a)}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(a.id)}
                className="p-2 hover:bg-red-100 text-red-600 rounded-lg"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
      {appliances.length === 0 && (
        <div className="rounded-xl border p-12 text-center text-slate-500">
          No appliances yet. Add some for the power backup calculator.
        </div>
      )}
    </div>
  )
}
