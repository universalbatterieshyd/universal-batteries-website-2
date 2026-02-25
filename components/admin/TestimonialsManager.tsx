'use client'

import { useState } from 'react'
import { Star, Plus, Pencil, Trash2 } from 'lucide-react'
import type { Testimonial } from '@/types/db'

export function TestimonialsManager({ initialTestimonials }: { initialTestimonials: Testimonial[] }) {
  const [testimonials, setTestimonials] = useState(initialTestimonials)
  const [editing, setEditing] = useState<Testimonial | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({
    quote: '',
    role: '',
    area: '',
    customerName: '',
    rating: 5,
    isApproved: true,
  })

  const resetForm = () => {
    setForm({
      quote: '',
      role: '',
      area: '',
      customerName: '',
      rating: 5,
      isApproved: true,
    })
    setEditing(null)
    setCreating(false)
  }

  const handleEdit = (t: Testimonial) => {
    setEditing(t)
    setForm({
      quote: t.quote,
      role: t.role,
      area: t.area || '',
      customerName: t.customerName || '',
      rating: t.rating,
      isApproved: t.isApproved ?? true,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editing) {
        const res = await fetch(`/api/testimonials/${editing.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        if (res.ok) {
          const updated = await res.json()
          setTestimonials((prev) => prev.map((t) => (t.id === editing.id ? updated : t)))
          resetForm()
        }
      } else {
        const res = await fetch('/api/testimonials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        if (res.ok) {
          const created = await res.json()
          setTestimonials((prev) => [...prev, created])
          resetForm()
        }
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this testimonial?')) return
    const res = await fetch(`/api/testimonials/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setTestimonials((prev) => prev.filter((t) => t.id !== id))
      if (editing?.id === id) resetForm()
    }
  }

  return (
    <div className="space-y-8">
      <button
        onClick={() => {
          resetForm()
          setCreating(true)
        }}
        className="flex items-center gap-2 px-4 py-2 bg-energy-red text-white rounded-lg hover:bg-[#C8161D] font-medium"
      >
        <Plus className="w-4 h-4" />
        Add Testimonial
      </button>

      {(editing || creating) && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl border border-gray-200 p-6 space-y-4"
        >
          <h3 className="font-heading font-semibold text-lg">
            {editing ? 'Edit Testimonial' : 'New Testimonial'}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quote *</label>
              <textarea
                value={form.quote}
                onChange={(e) => setForm({ ...form, quote: e.target.value })}
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role/Type *</label>
                <input
                  type="text"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  required
                  placeholder="e.g. Car Owner, Workshop Owner"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Area</label>
                <input
                  type="text"
                  value={form.area}
                  onChange={(e) => setForm({ ...form, area: e.target.value })}
                  placeholder="e.g. Secunderabad"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                <select
                  value={form.rating}
                  onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n} star{n > 1 ? 's' : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isApproved"
                  checked={form.isApproved}
                  onChange={(e) => setForm({ ...form, isApproved: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="isApproved" className="text-sm font-medium text-gray-700">
                  Show on website
                </label>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-energy-red text-white rounded-lg hover:bg-[#C8161D] font-medium"
            >
              {editing ? 'Save' : 'Create'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="grid gap-4">
        {testimonials.map((t) => (
          <div
            key={t.id}
            className="bg-white rounded-xl border border-gray-200 p-6 flex items-start justify-between"
          >
            <div>
              <div className="flex gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < t.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`}
                  />
                ))}
              </div>
              <p className="text-gray-700 italic">&ldquo;{t.quote}&rdquo;</p>
              <p className="font-medium text-gray-900 mt-2">{t.role}</p>
              {t.area && <p className="text-sm text-gray-500">{t.area}</p>}
              {!t.isApproved && (
                <span className="inline-block mt-2 px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded">
                  Hidden
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(t)}
                className="p-2 text-gray-500 hover:text-energy-red hover:bg-energy-red/5 rounded-lg"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(t.id)}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
