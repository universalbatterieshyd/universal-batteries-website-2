'use client'

import { useState, useRef } from 'react'
import { Car, Plus, Pencil, Trash2, Upload, FileSpreadsheet } from 'lucide-react'
import type { Vehicle } from '@/app/admin/vehicles/page'

export function VehiclesManager({ initialVehicles }: { initialVehicles: Vehicle[] }) {
  const [vehicles, setVehicles] = useState(initialVehicles)
  const [editing, setEditing] = useState<Vehicle | null>(null)
  const [creating, setCreating] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<{ success: boolean; imported?: number; error?: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({
    brand: '',
    model: '',
    fuelType: '',
    vehicleSegment: '',
    capacityAh: '',
  })

  const resetForm = () => {
    setForm({ brand: '', model: '', fuelType: '', vehicleSegment: '', capacityAh: '' })
    setEditing(null)
    setCreating(false)
  }

  const handleEdit = (v: Vehicle) => {
    setEditing(v)
    setForm({
      brand: v.brand,
      model: v.model,
      fuelType: v.fuelType || '',
      vehicleSegment: v.vehicleSegment || '',
      capacityAh: v.capacityAh != null ? String(v.capacityAh) : '',
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.brand || !form.model) return
    try {
      if (editing) {
        const res = await fetch(`/api/vehicles/${editing.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            brand: form.brand,
            model: form.model,
            fuelType: form.fuelType || null,
            vehicleSegment: form.vehicleSegment || null,
            capacityAh: form.capacityAh ? parseInt(form.capacityAh, 10) : null,
          }),
        })
        if (res.ok) {
          const updated = await res.json()
          setVehicles((prev) =>
            prev.map((v) =>
              v.id === editing.id
                ? {
                    ...v,
                    brand: updated.brand,
                    model: updated.model,
                    fuelType: updated.fuelType,
                    vehicleSegment: updated.vehicleSegment,
                    capacityAh: updated.capacityAh,
                  }
                : v
            )
          )
          resetForm()
        }
      } else {
        const res = await fetch('/api/vehicles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            brand: form.brand,
            model: form.model,
            fuelType: form.fuelType || null,
            vehicleSegment: form.vehicleSegment || null,
            capacityAh: form.capacityAh ? parseInt(form.capacityAh, 10) : null,
          }),
        })
        if (res.ok) {
          const created = await res.json()
          setVehicles((prev) => [
            ...prev,
            {
              id: created.id,
              brand: created.brand,
              model: created.model,
              fuelType: created.fuelType,
              vehicleSegment: created.vehicleSegment,
              capacityAh: created.capacityAh,
              batteryGroupId: created.batteryGroupId,
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
    if (!confirm('Delete this vehicle?')) return
    const res = await fetch(`/api/vehicles/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setVehicles((prev) => prev.filter((v) => v.id !== id))
      if (editing?.id === id) resetForm()
    }
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    setImportResult(null)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/vehicles/import', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setImportResult({ success: true, imported: data.imported })
        window.location.reload()
      } else {
        setImportResult({ success: false, error: data.error || 'Import failed' })
      }
    } catch {
      setImportResult({ success: false, error: 'Import failed' })
    } finally {
      setImporting(false)
      e.target.value = ''
    }
  }

  const brands = [...new Set(vehicles.map((v) => v.brand))].sort()

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => {
            resetForm()
            setCreating(true)
          }}
          className="flex items-center gap-2 px-4 py-2 bg-[#E31B23] text-white rounded-lg hover:bg-[#C8161D]"
        >
          <Plus className="h-4 w-4" />
          Add vehicle
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleImport}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={importing}
          className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50"
        >
          <Upload className="h-4 w-4" />
          {importing ? 'Importing...' : 'Import CSV'}
        </button>
      </div>

      {importResult && (
        <div
          className={`rounded-lg p-4 ${
            importResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}
        >
          {importResult.success ? (
            <span>Imported {importResult.imported} vehicles. Page refreshed.</span>
          ) : (
            <span>{importResult.error}</span>
          )}
        </div>
      )}

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
        <div className="flex items-center gap-2 font-medium mb-2">
          <FileSpreadsheet className="h-4 w-4" />
          CSV format
        </div>
        <p className="mb-2">
          Use headers: <code className="bg-white px-1 rounded">brand</code>,{' '}
          <code className="bg-white px-1 rounded">model</code>,{' '}
          <code className="bg-white px-1 rounded">fuel_type</code>,{' '}
          <code className="bg-white px-1 rounded">segment</code>,{' '}
          <code className="bg-white px-1 rounded">capacity_ah</code>
        </p>
        <p className="text-xs">
          Or Zipowatt format: Vehicle Make, Vehicle Segment, Brand + Model, Battery Capacity (AH), Fuel Types. Segment: CARS→car, SUV→suv, BIKES→bike, TRUCKS→truck.
        </p>
      </div>

      {(creating || editing) && (
        <form onSubmit={handleSubmit} className="rounded-xl border p-6 space-y-4">
          <h3 className="font-semibold">{editing ? 'Edit vehicle' : 'Add vehicle'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Brand *</label>
              <input
                type="text"
                value={form.brand}
                onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="e.g. Maruti Suzuki"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Model *</label>
              <input
                type="text"
                value={form.model}
                onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="e.g. Swift"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Fuel type</label>
              <input
                type="text"
                value={form.fuelType}
                onChange={(e) => setForm((f) => ({ ...f, fuelType: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="e.g. Petrol, Diesel"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Segment</label>
              <input
                type="text"
                value={form.vehicleSegment}
                onChange={(e) => setForm((f) => ({ ...f, vehicleSegment: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="e.g. car, bike"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Capacity (Ah)</label>
              <input
                type="number"
                value={form.capacityAh}
                onChange={(e) => setForm((f) => ({ ...f, capacityAh: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="e.g. 35"
              />
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

      <div className="space-y-4">
        {brands.map((brand) => (
          <div key={brand} className="rounded-xl border p-4">
            <div className="flex items-center gap-2 mb-3">
              <Car className="h-4 w-4 text-slate-600" />
              <span className="font-semibold">{brand}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {vehicles
                .filter((v) => v.brand === brand)
                .map((v) => (
                  <div
                    key={v.id}
                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg text-sm"
                  >
                    <span>{v.model}</span>
                    {v.fuelType && (
                      <span className="text-slate-500">({v.fuelType})</span>
                    )}
                    <button
                      onClick={() => handleEdit(v)}
                      className="p-1 hover:bg-slate-200 rounded"
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => handleDelete(v.id)}
                      className="p-1 hover:bg-red-100 text-red-600 rounded"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
            </div>
          </div>
        ))}
        {vehicles.length === 0 && (
          <div className="rounded-xl border p-12 text-center text-slate-500">
            No vehicles yet. Add some to power the battery finder.
          </div>
        )}
      </div>
    </div>
  )
}
