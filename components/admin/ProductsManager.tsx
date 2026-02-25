'use client'

import { useState } from 'react'
import { Package, Plus, Pencil, Trash2, FolderOpen } from 'lucide-react'
import type { Product, ProductCategory } from '@/types/db'

export function ProductsManager({
  initialProducts,
  initialCategories,
}: {
  initialProducts: Product[]
  initialCategories: ProductCategory[]
}) {
  const [products, setProducts] = useState(initialProducts)
  const [categories, setCategories] = useState(initialCategories)
  const [editing, setEditing] = useState<Product | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    categoryId: '',
    isActive: true,
  })

  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      categoryId: categories[0]?.id || '',
      isActive: true,
    })
    setEditing(null)
    setCreating(false)
  }

  const handleEdit = (p: Product) => {
    setEditing(p)
    setForm({
      title: p.title,
      description: p.description || '',
      categoryId: p.categoryId,
      isActive: p.isActive,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.categoryId) return
    try {
      if (editing) {
        const res = await fetch(`/api/products/${editing.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        if (res.ok) {
          const updated = await res.json()
          setProducts((prev) => prev.map((p) => (p.id === editing.id ? updated : p)))
          resetForm()
        }
      } else {
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        if (res.ok) {
          const created = await res.json()
          setProducts((prev) => [...prev, created])
          resetForm()
        }
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setProducts((prev) => prev.filter((p) => p.id !== id))
      if (editing?.id === id) resetForm()
    }
  }

  const productsByCategory = categories.map((cat) => ({
    category: cat,
    products: products.filter((p) => p.categoryId === cat.id),
  }))

  return (
    <div className="space-y-8">
      <button
        onClick={() => {
          resetForm()
          setForm((f) => ({ ...f, categoryId: categories[0]?.id || '' }))
          setCreating(true)
        }}
        disabled={categories.length === 0}
        className="flex items-center gap-2 px-4 py-2 bg-energy-red text-white rounded-lg hover:bg-[#C8161D] font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Plus className="w-4 h-4" />
        Add Product
      </button>

      {(editing || creating) && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl border border-gray-200 p-6 space-y-4"
        >
          <h3 className="font-heading font-semibold text-lg">
            {editing ? 'Edit Product' : 'New Product'}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Select category</option>
                {categories
                  .filter((c) => !(c as { parentId?: string }).parentId)
                  .map((parent) => {
                    const subs = categories.filter(
                      (c) => (c as { parentId?: string }).parentId === parent.id
                    )
                    return (
                      <optgroup key={parent.id} label={parent.name}>
                        <option value={parent.id}>{parent.name}</option>
                        {subs.map((sub) => (
                          <option key={sub.id} value={sub.id}>
                            — {sub.name}
                          </option>
                        ))}
                      </optgroup>
                    )
                  })}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                Active (show on website)
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

      <div className="space-y-8">
        {productsByCategory.map(({ category, products: catProducts }) => (
          <div key={category.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-gray-500" />
              <h3 className="font-heading font-semibold text-lg">{category.name}</h3>
              <span className="text-sm text-gray-500">({catProducts.length} products)</span>
            </div>
            <div className="divide-y divide-gray-100">
              {catProducts.map((p) => (
                <div
                  key={p.id}
                  className="px-6 py-4 flex items-center justify-between hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                      <Package className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="font-medium">{p.title}</p>
                      {p.description && (
                        <p className="text-sm text-gray-500 line-clamp-1">{p.description}</p>
                      )}
                      {!p.isActive && (
                        <span className="text-xs text-gray-400">(Hidden)</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(p)}
                      className="p-2 text-gray-500 hover:text-energy-red hover:bg-energy-red/5 rounded-lg"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {catProducts.length === 0 && (
                <div className="px-6 py-8 text-center text-gray-500">
                  No products in this category
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
