'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Eye, EyeOff, Plus, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SectionConfigEditor } from './SectionConfigEditor'

type Section = {
  id: string
  section_key: string
  order: number
  is_visible: boolean
  config?: Record<string, unknown> | null
  label?: string
}

const ADDABLE_TEMPLATES = [
  { key: 'features_grid', label: 'Features Grid' },
  { key: 'image_text', label: 'Image + Text' },
  { key: 'faq', label: 'FAQ' },
  { key: 'cta_banner', label: 'CTA Banner' },
] as const

function SortableSectionItem({
  section,
  onToggleVisibility,
  onEdit,
  onDelete,
}: {
  section: Section
  onToggleVisibility: (id: string) => void
  onEdit: (section: Section) => void
  onDelete: (id: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const canEdit = ['features_grid', 'image_text', 'faq', 'cta_banner'].includes(section.section_key)

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 px-4 py-3 bg-white border rounded-lg shadow-sm ${
        isDragging ? 'opacity-90 shadow-md z-10' : ''
      }`}
    >
      <button
        type="button"
        className="cursor-grab active:cursor-grabbing touch-none text-gray-400 hover:text-gray-600"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-5 h-5" />
      </button>
      <span className="flex-1 font-medium text-gray-900">
        {section.label || section.section_key}
      </span>
      <div className="flex items-center gap-1">
        {canEdit && (
          <button
            type="button"
            onClick={() => onEdit(section)}
            className="p-2 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-700"
            title="Edit content"
          >
            <Pencil className="w-4 h-4" />
          </button>
        )}
        <button
          type="button"
          onClick={() => onToggleVisibility(section.id)}
          className="p-2 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-700"
          title={section.is_visible ? 'Hide section' : 'Show section'}
        >
          {section.is_visible ? (
            <Eye className="w-5 h-5" />
          ) : (
            <EyeOff className="w-5 h-5 opacity-50" />
          )}
        </button>
        <button
          type="button"
          onClick={() => onDelete(section.id)}
          className="p-2 rounded-md hover:bg-red-50 text-gray-500 hover:text-red-600"
          title="Remove section"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export function PageBuilderManager() {
  const [sections, setSections] = useState<Section[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [previewKey, setPreviewKey] = useState(0)
  const [editSection, setEditSection] = useState<Section | null>(null)
  const [configEditorOpen, setConfigEditorOpen] = useState(false)
  const [adding, setAdding] = useState(false)

  const loadSections = useCallback(async () => {
    try {
      const res = await fetch('/api/homepage-sections')
      const data = await res.json()
      if (res.ok && Array.isArray(data)) {
        setSections(data)
      }
    } catch {
      // API may not exist if migration not run
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSections()
  }, [loadSections])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = sections.findIndex((s) => s.id === active.id)
    const newIndex = sections.findIndex((s) => s.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return
    const reordered = arrayMove(sections, oldIndex, newIndex).map((s, i) => ({
      ...s,
      order: i,
    }))
    setSections(reordered)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/homepage-sections', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sections: sections.map((s, i) => ({
            id: s.id,
            order: i,
            is_visible: s.is_visible,
          })),
        }),
      })
      if (res.ok) {
        setSaved(true)
        setPreviewKey((k) => k + 1)
        setTimeout(() => setSaved(false), 3000)
        loadSections()
      }
    } finally {
      setSaving(false)
    }
  }

  const handleToggleVisibility = (id: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, is_visible: !s.is_visible } : s))
    )
  }

  const handleAddSection = async (sectionKey: string) => {
    setAdding(true)
    try {
      const res = await fetch('/api/homepage-sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section_key: sectionKey }),
      })
      if (res.ok) {
        await loadSections()
        setPreviewKey((k) => k + 1)
      }
    } finally {
      setAdding(false)
    }
  }

  const handleDeleteSection = async (id: string) => {
    if (!confirm('Remove this section from the homepage?')) return
    try {
      const res = await fetch(`/api/homepage-sections/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setSections((prev) => prev.filter((s) => s.id !== id))
        setPreviewKey((k) => k + 1)
      }
    } catch {
      // ignore
    }
  }

  const handleConfigSave = async (id: string, config: Record<string, unknown>) => {
    const res = await fetch(`/api/homepage-sections/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ config }),
    })
    if (res.ok) {
      setSections((prev) =>
        prev.map((s) => (s.id === id ? { ...s, config } : s))
      )
      setPreviewKey((k) => k + 1)
    }
  }

  const handleEdit = (section: Section) => {
    setEditSection(section)
    setConfigEditorOpen(true)
  }

  if (loading) {
    return <p className="text-gray-500">Loading sections...</p>
  }
  if (sections.length === 0) {
    return (
      <p className="text-amber-600">
        No sections found. Run the Supabase migration (supabase/migrations/003_homepage_sections.sql)
        to create the homepage_sections table.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Page sections – drag to reorder
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Drag sections to reorder. Add new sections from templates. Use the pencil to edit content, eye to show/hide, and trash to remove.
        </p>

        <div className="mb-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button disabled={adding}>
                <Plus className="w-4 h-4 mr-2" />
                Add section
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {ADDABLE_TEMPLATES.map((t) => (
                <DropdownMenuItem
                  key={t.key}
                  onClick={() => handleAddSection(t.key)}
                >
                  {t.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sections.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {sections.map((section) => (
                <SortableSectionItem
                  key={section.id}
                  section={section}
                  onToggleVisibility={handleToggleVisibility}
                  onEdit={handleEdit}
                  onDelete={handleDeleteSection}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
        <div className="mt-4 flex items-center gap-3">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save order'}
          </Button>
          {saved && <span className="text-green-600 text-sm">Saved!</span>}
          <Button variant="outline" size="sm" asChild>
            <a href="/" target="_blank" rel="noopener noreferrer">
              Open site in new tab
            </a>
          </Button>
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Preview</h3>
        <p className="text-sm text-gray-500 mb-2">
          After saving, the preview below updates to show the new layout.
        </p>
        <div className="rounded-lg border border-gray-200 overflow-hidden bg-white shadow-sm">
          <iframe
            key={previewKey}
            src="/"
            title="Homepage preview"
            className="w-full h-[600px]"
          />
        </div>
      </div>

      <SectionConfigEditor
        section={editSection}
        open={configEditorOpen}
        onOpenChange={setConfigEditorOpen}
        onSave={handleConfigSave}
      />
    </div>
  )
}
