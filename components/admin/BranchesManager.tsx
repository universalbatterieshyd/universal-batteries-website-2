'use client'

import { useState } from 'react'
import { MapPin, Plus, Pencil, Trash2 } from 'lucide-react'
import type { Branch } from '@/types/db'

export function BranchesManager({ initialBranches }: { initialBranches: Branch[] }) {
  const [branches, setBranches] = useState(initialBranches)
  const [editing, setEditing] = useState<Branch | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    hours: '',
    manager: '',
    mapsUrl: '',
    isMain: false,
  })

  const resetForm = () => {
    setForm({
      name: '',
      address: '',
      phone: '',
      email: '',
      hours: '',
      manager: '',
      mapsUrl: '',
      isMain: false,
    })
    setEditing(null)
    setCreating(false)
  }

  const handleEdit = (b: Branch) => {
    setEditing(b)
    setForm({
      name: b.name,
      address: b.address,
      phone: b.phone,
      email: b.email || '',
      hours: b.hours || '',
      manager: b.manager || '',
      mapsUrl: b.mapsUrl || '',
      isMain: b.isMain,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editing) {
        const res = await fetch(`/api/branches/${editing.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        if (res.ok) {
          const updated = await res.json()
          setBranches((prev) => prev.map((b) => (b.id === editing.id ? updated : b)))
          resetForm()
        }
      } else {
        const res = await fetch('/api/branches', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        if (res.ok) {
          const created = await res.json()
          setBranches((prev) => [...prev, created].sort((a, b) => (a.isMain ? -1 : b.isMain ? 1 : 0)))
          resetForm()
        }
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this branch?')) return
    const res = await fetch(`/api/branches/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setBranches((prev) => prev.filter((b) => b.id !== id))
      if (editing?.id === id) resetForm()
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <button
          onClick={() => {
            resetForm()
            setCreating(true)
          }}
          className="flex items-center gap-2 px-4 py-2 bg-energy-red text-white rounded-lg hover:bg-[#C8161D] font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Branch
        </button>
      </div>

      {(editing || creating) && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl border border-gray-200 p-6 space-y-4"
        >
          <h3 className="font-heading font-semibold text-lg">
            {editing ? 'Edit Branch' : 'New Branch'}
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hours</label>
              <input
                type="text"
                value={form.hours}
                onChange={(e) => setForm({ ...form, hours: e.target.value })}
                placeholder="Mon-Sat: 9 AM - 7 PM"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Manager</label>
              <input
                type="text"
                value={form.manager}
                onChange={(e) => setForm({ ...form, manager: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Google Maps URL</label>
              <input
                type="url"
                value={form.mapsUrl}
                onChange={(e) => setForm({ ...form, mapsUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isMain"
                checked={form.isMain}
                onChange={(e) => setForm({ ...form, isMain: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="isMain" className="text-sm font-medium text-gray-700">
                Main branch
              </label>
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
        {branches.map((branch) => (
          <div
            key={branch.id}
            className="bg-white rounded-xl border border-gray-200 p-6 flex items-start justify-between"
          >
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-6 h-6 text-gray-500" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-heading font-semibold text-lg">{branch.name}</h3>
                  {branch.isMain && (
                    <span className="px-2 py-0.5 bg-energy-red/10 text-energy-red text-xs font-medium rounded">
                      Main
                    </span>
                  )}
                </div>
                <p className="text-gray-600 text-sm mt-1">{branch.address}</p>
                <p className="text-gray-500 text-sm">{branch.phone}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(branch)}
                className="p-2 text-gray-500 hover:text-energy-red hover:bg-energy-red/5 rounded-lg"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(branch.id)}
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
