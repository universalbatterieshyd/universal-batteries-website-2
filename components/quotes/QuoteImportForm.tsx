'use client'

import { useState } from 'react'
import { Upload } from 'lucide-react'

type ImportResult = {
  ok: boolean
  products_parsed: number
  inserted: number
  updated: number
  buyback_slabs: number
  sheet_stats: { sheet: string; count: number }[]
  warnings: string[]
  unmatched_categories: string[]
  error?: string
}

export function QuoteImportForm() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [error, setError] = useState('')

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/quotes/import', { method: 'POST', body: fd })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || 'Import failed')
      } else {
        setResult(json)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <form
        onSubmit={onSubmit}
        className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Dealer price workbook (.xlsx)
          </label>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-[#004C8F]/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[#004C8F]"
          />
          <p className="mt-2 text-xs text-slate-500">
            Skips helper sheets (2 wheeler prices, Rack Sizer, etc.). Imports Weight Comparison as
            buyback slabs. Add a <strong>Category</strong> column to map SKUs to your tree leaves.
          </p>
        </div>
        <button
          type="submit"
          disabled={!file || loading}
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#E31B23] px-5 text-sm font-semibold text-white hover:bg-[#C8161D] disabled:opacity-50"
        >
          <Upload className="h-4 w-4" />
          {loading ? 'Importing…' : 'Import workbook'}
        </button>
      </form>

      {error && (
        <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm text-sm">
          <p className="font-semibold text-slate-900">Import complete</p>
          <ul className="space-y-1 text-slate-700">
            <li>Products parsed: {result.products_parsed}</li>
            <li>Inserted: {result.inserted}</li>
            <li>Updated: {result.updated}</li>
            <li>Buyback slabs: {result.buyback_slabs}</li>
          </ul>
          {result.sheet_stats?.length > 0 && (
            <div>
              <p className="font-medium text-slate-800">Per sheet</p>
              <ul className="mt-1 max-h-40 overflow-auto text-slate-600">
                {result.sheet_stats.map((s) => (
                  <li key={s.sheet}>
                    {s.sheet}: {s.count}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {result.unmatched_categories?.length > 0 && (
            <div className="rounded-lg bg-amber-50 px-3 py-2 text-amber-900">
              <p className="font-medium">Unmatched Category values (create these in Categories)</p>
              <p className="mt-1">{result.unmatched_categories.join(', ')}</p>
            </div>
          )}
          {result.warnings?.length > 0 && (
            <details className="text-slate-500">
              <summary>Warnings ({result.warnings.length})</summary>
              <ul className="mt-1 list-disc pl-5">
                {result.warnings.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}
    </div>
  )
}
