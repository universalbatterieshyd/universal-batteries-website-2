'use client'

import { useMemo, useState, useTransition } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Plus, Trash2 } from 'lucide-react'
import type { QuoteCategoryRow } from '@/app/quotes/admin/categories/page'

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function SortableRow({
  cat,
  depth,
  onChange,
  onDelete,
}: {
  cat: QuoteCategoryRow
  depth: number
  onChange: (id: string, patch: Partial<QuoteCategoryRow>) => void
  onDelete: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: cat.id,
  })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
    marginLeft: depth * 16,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white p-2 shadow-sm"
    >
      <button
        type="button"
        className="touch-none rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <input
        value={cat.name}
        onChange={(e) => onChange(cat.id, { name: e.target.value, slug: slugify(e.target.value) })}
        className="min-w-[8rem] flex-1 rounded-md border border-slate-200 px-2 py-1.5 text-sm"
        placeholder="Category name"
      />
      <label className="flex items-center gap-1 text-xs text-slate-500">
        GST%
        <input
          type="number"
          step="0.01"
          value={cat.gst_percent}
          onChange={(e) => onChange(cat.id, { gst_percent: Number(e.target.value) })}
          className="w-16 rounded-md border border-slate-200 px-1.5 py-1.5 text-sm"
        />
      </label>
      <button
        type="button"
        onClick={() => onDelete(cat.id)}
        className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
        aria-label="Delete"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  )
}

export function QuoteCategoryTree({
  initialCategories,
}: {
  initialCategories: QuoteCategoryRow[]
}) {
  const [categories, setCategories] = useState(initialCategories)
  const [parentId, setParentId] = useState<string>('')
  const [newName, setNewName] = useState('')
  const [message, setMessage] = useState('')
  const [pending, startTransition] = useTransition()

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const roots = useMemo(
    () => categories.filter((c) => !c.parent_id).sort((a, b) => a.sort_order - b.sort_order),
    [categories]
  )

  const childrenOf = (id: string) =>
    categories.filter((c) => c.parent_id === id).sort((a, b) => a.sort_order - b.sort_order)

  const flatVisible = useMemo(() => {
    const out: { cat: QuoteCategoryRow; depth: number }[] = []
    const walk = (nodes: QuoteCategoryRow[], depth: number) => {
      for (const n of nodes) {
        out.push({ cat: n, depth })
        walk(childrenOf(n.id), depth + 1)
      }
    }
    walk(roots, 0)
    return out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories])

  const persistOrder = (next: QuoteCategoryRow[]) => {
    startTransition(async () => {
      setMessage('')
      const res = await fetch('/api/quotes/categories/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: next.map((c, i) => ({ id: c.id, parent_id: c.parent_id, sort_order: i })),
        }),
      })
      if (!res.ok) setMessage('Failed to save order')
      else setMessage('Order saved')
    })
  }

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = flatVisible.findIndex((x) => x.cat.id === active.id)
    const newIndex = flatVisible.findIndex((x) => x.cat.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return

    // Reorder within same parent only (MVP)
    const moved = flatVisible[oldIndex].cat
    const target = flatVisible[newIndex].cat
    if (moved.parent_id !== target.parent_id) {
      setMessage('MVP: reorder within the same parent. Change parent via edit later.')
      return
    }

    const siblings = categories
      .filter((c) => c.parent_id === moved.parent_id)
      .sort((a, b) => a.sort_order - b.sort_order)
    const sOld = siblings.findIndex((c) => c.id === moved.id)
    const sNew = siblings.findIndex((c) => c.id === target.id)
    const reordered = arrayMove(siblings, sOld, sNew).map((c, i) => ({ ...c, sort_order: i }))
    const next = categories.map((c) => reordered.find((r) => r.id === c.id) ?? c)
    setCategories(next)
    persistOrder(reordered)
  }

  const addCategory = () => {
    if (!newName.trim()) return
    startTransition(async () => {
      setMessage('')
      const res = await fetch('/api/quotes/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.trim(),
          slug: slugify(newName),
          parent_id: parentId || null,
          gst_percent: 18,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        setMessage(json.error || 'Failed to add')
        return
      }
      setCategories((prev) => [...prev, json.category])
      setNewName('')
      setMessage('Category added')
    })
  }

  const saveField = (id: string, patch: Partial<QuoteCategoryRow>) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)))
    startTransition(async () => {
      await fetch(`/api/quotes/categories/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      })
    })
  }

  const remove = (id: string) => {
    if (!confirm('Delete this category and its children?')) return
    startTransition(async () => {
      const res = await fetch(`/api/quotes/categories/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        setMessage('Delete failed')
        return
      }
      setCategories((prev) => {
        const drop = new Set<string>()
        const gather = (pid: string) => {
          drop.add(pid)
          prev.filter((c) => c.parent_id === pid).forEach((c) => gather(c.id))
        }
        gather(id)
        return prev.filter((c) => !drop.has(c.id))
      })
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="text-xs font-medium text-slate-500">Name</label>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="e.g. Two-wheeler"
          />
        </div>
        <div className="sm:w-56">
          <label className="text-xs font-medium text-slate-500">Parent</label>
          <select
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="">Root</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={addCategory}
          disabled={pending}
          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-[#004C8F] px-4 text-sm font-semibold text-white hover:bg-[#003a6e] disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Add
        </button>
      </div>

      {message && <p className="text-sm text-slate-600">{message}</p>}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext
          items={flatVisible.map((x) => x.cat.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {flatVisible.length === 0 && (
              <p className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center text-slate-500">
                No categories yet. Add a root (e.g. Automotive), then nest children.
              </p>
            )}
            {flatVisible.map(({ cat, depth }) => (
              <SortableRow
                key={cat.id}
                cat={cat}
                depth={depth}
                onChange={saveField}
                onDelete={remove}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}
