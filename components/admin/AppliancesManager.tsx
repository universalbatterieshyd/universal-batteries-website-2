'use client'

import { useState } from 'react'
import { Zap, Plus, Pencil, Trash2 } from 'lucide-react'
import type { Appliance } from '@/app/admin/appliances/page'

export function AppliancesManager({ initialAppliances }: { initialAppliances: Appliance[] }) {
  const [appliances, setAppliances] = useState(initialAppliances)
  const [editing, setEditing] = useState<Appliance | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({
    key: '',
    name: '',
    watts: 0,
    emoji: '📦',
    showInVisual: true,
    order: 0,
  })

  const resetForm = () => {
    setForm({
      key: '',
      name: '',
      watts: 0,
      emoji: '📦',
      showInVisual: true,
      order: appliances.length,
    })
    setEditing(null)
    setCreating(false)
  }

  const handleEdit = (a: Appliance) => {
    setEditing(a)
    setForm({
      key: a.key,
      name: a.name,
      watts: a.watts,
      emoji: a.emoji,
      showInVisual: a.showInVisual,
      order: a.order,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.key || !form.name || form.watts <= 0) return
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
                    showInVisual: updated.showInVisual,
                    order: updated.order,
                  }
                : a
            )
          )
          resetForm()
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
              showInVisual: created.showInVisual,
              order: created.order,
            },
          ])
          resetForm()
        }
      }
    } catch (err) {
      console.error(err)
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
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Emoji</label>
              <input
                type="text"
                value={form.emoji}
                onChange={(e) => setForm((f) => ({ ...f, emoji: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="💡"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showInVisual"
                checked={form.showInVisual}
                onChange={(e) => setForm((f) => ({ ...f, showInVisual: e.target.checked }))}
              />
              <label htmlFor="showInVisual">Show in visual grid</label>
            </div>
          </div>
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
            <div className="flex items-center gap-3">
              <span className="text-2xl">{a.emoji}</span>
              <div>
                <div className="font-medium">{a.name}</div>
                <div className="text-sm text-slate-500">{a.watts}W</div>
              </div>
            </div>
            <div className="flex gap-1">
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
