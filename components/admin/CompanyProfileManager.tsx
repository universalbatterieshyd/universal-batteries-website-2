'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ArrowDown,
  ArrowUp,
  Building2,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  ImageIcon,
  Layers,
  MapPin,
  Plus,
  Save,
  Settings,
  Tag,
  Trash2,
} from 'lucide-react'
import { ImageUploadField } from '@/components/admin/ImageUploadField'
import { cn } from '@/lib/utils'
import type { CompanyProfileOverrides, ProfileBrand, ProfileCapability } from '@/lib/company-profile'

type SharedSnapshot = {
  phone: string
  whatsapp: string
  email: string
  gst: string
  websiteUrl: string
  logoUrl: string
  branches: {
    name: string
    address: string
    hours: string
    mapsUrl: string
    isMain: boolean
  }[]
}

type TabId = 'basics' | 'capabilities' | 'brands' | 'shared'

const TABS: { id: TabId; label: string; icon: typeof Layers; hint: string }[] = [
  { id: 'basics', label: 'Basics', icon: Building2, hint: 'Name, year, tagline, tax, PDF' },
  { id: 'capabilities', label: 'Capabilities', icon: Layers, hint: 'Category cards & images' },
  { id: 'brands', label: 'Brands', icon: Tag, hint: 'Brand names & logos' },
  { id: 'shared', label: 'Contact & locations', icon: MapPin, hint: 'Edited in Settings / Branches' },
]

export function CompanyProfileManager({
  initialProfile,
  shared,
}: {
  initialProfile: CompanyProfileOverrides
  shared: SharedSnapshot
}) {
  const [form, setForm] = useState<CompanyProfileOverrides>(initialProfile)
  const [tab, setTab] = useState<TabId>('basics')
  const [brandDraft, setBrandDraft] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checklist = useMemo(() => {
    const items = [
      { ok: Boolean(shared.logoUrl), label: 'Company logo', fix: '/admin/settings' },
      { ok: Boolean(shared.phone), label: 'Desk phone', fix: '/admin/settings' },
      { ok: Boolean(shared.whatsapp), label: 'WhatsApp', fix: '/admin/settings' },
      { ok: Boolean(shared.gst), label: 'GSTIN', fix: '/admin/settings' },
      { ok: Boolean(form.legalFirmName), label: 'Legal firm name', fix: null as string | null },
      { ok: shared.branches.length > 0, label: 'At least one branch', fix: '/admin/branches' },
      {
        ok: shared.branches.every((b) => b.mapsUrl),
        label: 'Maps links on all branches',
        fix: '/admin/branches',
      },
      {
        ok: form.brands.some((b) => b.logoUrl),
        label: 'At least one brand logo',
        fix: null,
      },
    ]
    return items
  }, [form.legalFirmName, form.brands, shared])

  const missingCount = checklist.filter((c) => !c.ok).length

  const updateCapability = (index: number, patch: Partial<ProfileCapability>) => {
    setForm((f) => ({
      ...f,
      capabilities: f.capabilities.map((c, i) => (i === index ? { ...c, ...patch } : c)),
    }))
  }

  const moveCapability = (index: number, dir: -1 | 1) => {
    setForm((f) => {
      const next = [...f.capabilities]
      const j = index + dir
      if (j < 0 || j >= next.length) return f
      ;[next[index], next[j]] = [next[j], next[index]]
      return { ...f, capabilities: next }
    })
  }

  const addCapability = () => {
    if (form.capabilities.length >= 8) return
    setForm((f) => ({
      ...f,
      capabilities: [...f.capabilities, { title: '', description: '' }],
    }))
  }

  const removeCapability = (index: number) => {
    if (!confirm('Remove this capability card?')) return
    setForm((f) => ({
      ...f,
      capabilities: f.capabilities.filter((_, i) => i !== index),
    }))
  }

  const updateBrand = (index: number, patch: Partial<ProfileBrand>) => {
    setForm((f) => ({
      ...f,
      brands: f.brands.map((b, i) => (i === index ? { ...b, ...patch } : b)),
    }))
  }

  const moveBrand = (index: number, dir: -1 | 1) => {
    setForm((f) => {
      const next = [...f.brands]
      const j = index + dir
      if (j < 0 || j >= next.length) return f
      ;[next[index], next[j]] = [next[j], next[index]]
      return { ...f, brands: next }
    })
  }

  const addBrand = () => {
    const name = brandDraft.trim()
    if (!name) return
    if (form.brands.some((b) => b.name.toLowerCase() === name.toLowerCase())) {
      setBrandDraft('')
      return
    }
    setForm((f) => ({ ...f, brands: [...f.brands, { name }] }))
    setBrandDraft('')
  }

  const removeBrand = (index: number) => {
    if (!confirm(`Remove ${form.brands[index]?.name || 'this brand'}?`)) return
    setForm((f) => ({ ...f, brands: f.brands.filter((_, i) => i !== index) }))
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/company-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error || `Save failed (${res.status})`)
        return
      }
      setForm(data)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      {/* Top bar */}
      <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-slate-600">
            Edits the public page at{' '}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">/profile</code>
          </p>
          {missingCount > 0 ? (
            <p className="mt-1 text-xs text-amber-700">
              {missingCount} item{missingCount === 1 ? '' : 's'} still incomplete — see checklist under Basics.
            </p>
          ) : (
            <p className="mt-1 text-xs text-emerald-700">Looks complete for QR print.</p>
          )}
        </div>
        <a
          href="/profile"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 text-sm font-medium text-slate-800 hover:bg-slate-50"
        >
          Preview live page
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 px-4 sm:px-6">
        <nav className="-mb-px flex gap-1 overflow-x-auto" aria-label="Company profile sections">
          {TABS.map((t) => {
            const Icon = t.icon
            const active = tab === t.id
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  'flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-sm font-medium transition',
                  active
                    ? 'border-[#E31B23] text-slate-900'
                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800'
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{t.label}</span>
                {t.id === 'capabilities' && (
                  <span className="rounded-full bg-slate-100 px-1.5 text-[11px] text-slate-600">
                    {form.capabilities.length}
                  </span>
                )}
                {t.id === 'brands' && (
                  <span className="rounded-full bg-slate-100 px-1.5 text-[11px] text-slate-600">
                    {form.brands.length}
                  </span>
                )}
              </button>
            )
          })}
        </nav>
      </div>

      <div className="space-y-6 p-6 pb-28">
        {tab === 'basics' && (
          <div className="space-y-6">
            <SectionIntro
              title="Page basics"
              body="These appear in the header and tax block. The company logo comes from Settings and stands in for the name on the page."
            />

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
              <div className="space-y-4 rounded-xl border border-slate-200 p-5 lg:col-span-2">
                <Field label="Company name" hint="SEO + vCard only when logo is set">
                  <input
                    className={inputClass}
                    value={form.companyName}
                    onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                  />
                </Field>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Established year">
                    <input
                      className={inputClass}
                      value={form.establishedYear}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          establishedYear: e.target.value.replace(/\D/g, '').slice(0, 4),
                        })
                      }
                      inputMode="numeric"
                      placeholder="1992"
                    />
                  </Field>
                  <Field label="Legal firm name">
                    <input
                      className={inputClass}
                      value={form.legalFirmName}
                      onChange={(e) => setForm({ ...form, legalFirmName: e.target.value })}
                      placeholder="As on GST certificate"
                    />
                  </Field>
                </div>
                <Field label="Tagline">
                  <input
                    className={inputClass}
                    value={form.tagline}
                    onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                  />
                </Field>
                <Field label="WhatsApp prefill" hint="Opens when someone taps WhatsApp on /profile">
                  <textarea
                    className={inputClass}
                    rows={2}
                    value={form.whatsappPrefill}
                    onChange={(e) => setForm({ ...form, whatsappPrefill: e.target.value })}
                  />
                </Field>
                <Field label="Company profile PDF URL" hint="Leave blank to hide the download button">
                  <input
                    className={inputClass}
                    value={form.companyProfilePdfUrl}
                    onChange={(e) => setForm({ ...form, companyProfilePdfUrl: e.target.value })}
                    placeholder="https://..."
                  />
                </Field>
              </div>

              <aside className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <h3 className="text-sm font-semibold text-slate-900">Readiness checklist</h3>
                <ul className="mt-3 space-y-2">
                  {checklist.map((item) => (
                    <li key={item.label} className="flex items-start gap-2 text-sm">
                      <CheckCircle2
                        className={cn(
                          'mt-0.5 h-4 w-4 shrink-0',
                          item.ok ? 'text-emerald-600' : 'text-slate-300'
                        )}
                      />
                      <div className="min-w-0">
                        <p className={item.ok ? 'text-slate-700' : 'text-slate-900'}>{item.label}</p>
                        {!item.ok && item.fix && (
                          <Link href={item.fix} className="text-xs font-medium text-[#004C8F] hover:underline">
                            Fix in {item.fix.includes('branches') ? 'Branches' : 'Settings'} →
                          </Link>
                        )}
                        {!item.ok && !item.fix && (
                          <p className="text-xs text-slate-500">Fill on this tab / Brands tab</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => setTab('shared')}
                  className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-[#004C8F]"
                >
                  View contact & locations
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </aside>
            </div>
          </div>
        )}

        {tab === 'capabilities' && (
          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <SectionIntro
                title="Capability cards"
                body="Each card can show an image. Title and description stay visible under the image."
              />
              <button
                type="button"
                onClick={addCapability}
                disabled={form.capabilities.length >= 8}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                Add card
              </button>
            </div>

            {form.capabilities.length === 0 ? (
              <EmptyState
                icon={<Layers className="h-5 w-5" />}
                title="No capability cards yet"
                actionLabel="Add first card"
                onAction={addCapability}
              />
            ) : (
              <div className="space-y-4">
                {form.capabilities.map((cap, i) => (
                  <div key={i} className="overflow-hidden rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50 px-4 py-2.5">
                      <p className="text-sm font-medium text-slate-800">
                        Card {i + 1}
                        {cap.title ? (
                          <span className="font-normal text-slate-500"> · {cap.title}</span>
                        ) : (
                          <span className="font-normal text-amber-700"> · Untitled</span>
                        )}
                      </p>
                      <div className="flex items-center gap-1">
                        <IconBtn label="Move up" onClick={() => moveCapability(i, -1)} disabled={i === 0}>
                          <ArrowUp className="h-4 w-4" />
                        </IconBtn>
                        <IconBtn
                          label="Move down"
                          onClick={() => moveCapability(i, 1)}
                          disabled={i === form.capabilities.length - 1}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </IconBtn>
                        <IconBtn label="Remove" onClick={() => removeCapability(i)} danger>
                          <Trash2 className="h-4 w-4" />
                        </IconBtn>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 p-4 lg:grid-cols-[200px_1fr]">
                      <div>
                        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-400">
                          Card image
                        </p>
                        {cap.imageUrl ? (
                          <div className="mb-2 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={cap.imageUrl} alt="" className="aspect-[16/9] w-full object-cover" />
                          </div>
                        ) : (
                          <div className="mb-2 flex aspect-[16/9] items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-slate-400">
                            <ImageIcon className="h-6 w-6" />
                          </div>
                        )}
                        <ImageUploadField
                          type="category"
                          value={cap.imageUrl || ''}
                          onChange={(imageUrl) => updateCapability(i, { imageUrl: imageUrl || undefined })}
                          placeholder="Upload image"
                          previewSize="sm"
                        />
                      </div>
                      <div className="space-y-3">
                        <Field label="Title">
                          <input
                            className={inputClass}
                            value={cap.title}
                            onChange={(e) => updateCapability(i, { title: e.target.value })}
                            placeholder="e.g. Automotive & Genset"
                          />
                        </Field>
                        <Field label="Description">
                          <textarea
                            className={inputClass}
                            rows={3}
                            value={cap.description}
                            onChange={(e) => updateCapability(i, { description: e.target.value })}
                            placeholder="Short factual line"
                          />
                        </Field>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'brands' && (
          <div className="space-y-4">
            <SectionIntro
              title="Brands we supply"
              body="Add a logo to show the brand mark on /profile. The name is kept for SEO even when the logo is visible."
            />

            <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:flex-row">
              <input
                className={cn(inputClass, 'bg-white')}
                value={brandDraft}
                onChange={(e) => setBrandDraft(e.target.value)}
                placeholder="New brand name, e.g. Exide"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addBrand()
                  }
                }}
              />
              <button
                type="button"
                onClick={addBrand}
                className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-800"
              >
                <Plus className="h-4 w-4" />
                Add brand
              </button>
            </div>

            {form.brands.length === 0 ? (
              <EmptyState
                icon={<Tag className="h-5 w-5" />}
                title="No brands yet"
                actionLabel="Add a brand above"
              />
            ) : (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {form.brands.map((brand, i) => (
                  <div key={`${brand.name}-${i}`} className="rounded-xl border border-slate-200 p-4">
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                        Brand {i + 1}
                      </p>
                      <div className="flex items-center gap-1">
                        <IconBtn label="Move up" onClick={() => moveBrand(i, -1)} disabled={i === 0}>
                          <ArrowUp className="h-4 w-4" />
                        </IconBtn>
                        <IconBtn
                          label="Move down"
                          onClick={() => moveBrand(i, 1)}
                          disabled={i === form.brands.length - 1}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </IconBtn>
                        <IconBtn label="Remove" onClick={() => removeBrand(i)} danger>
                          <Trash2 className="h-4 w-4" />
                        </IconBtn>
                      </div>
                    </div>
                    <div className="mb-3 flex items-center gap-3">
                      <div className="flex h-14 w-20 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 p-2">
                        {brand.logoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={brand.logoUrl} alt="" className="max-h-full max-w-full object-contain" />
                        ) : (
                          <span className="text-[10px] text-slate-400">No logo</span>
                        )}
                      </div>
                      <input
                        className={inputClass}
                        value={brand.name}
                        onChange={(e) => updateBrand(i, { name: e.target.value })}
                        placeholder="Brand name"
                      />
                    </div>
                    <ImageUploadField
                      type="brand"
                      label="Logo"
                      value={brand.logoUrl || ''}
                      onChange={(logoUrl) => updateBrand(i, { logoUrl: logoUrl || undefined })}
                      placeholder="Upload logo"
                      previewSize="sm"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'shared' && (
          <div className="space-y-6">
            <SectionIntro
              title="Contact & locations"
              body="These are shared across the website. Change them in Settings or Branches — they automatically feed /profile."
            />

            <div className="rounded-xl border border-slate-200">
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-slate-500" />
                  <h3 className="text-sm font-semibold text-slate-900">From Settings</h3>
                </div>
                <Link
                  href="/admin/settings"
                  className="inline-flex items-center gap-1 text-sm font-medium text-[#004C8F] hover:underline"
                >
                  Open Settings
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              <dl className="grid grid-cols-1 gap-0 sm:grid-cols-2">
                <SharedCell label="Desk phone" value={shared.phone} />
                <SharedCell label="WhatsApp" value={shared.whatsapp} />
                <SharedCell label="Email" value={shared.email} />
                <SharedCell label="GSTIN" value={shared.gst} emptyHint="Add in Settings to show on /profile" />
                <SharedCell label="Website URL" value={shared.websiteUrl} />
                <SharedCell label="Logo (dark background)" value={shared.logoUrl ? 'Uploaded' : ''} emptyHint="Upload in Settings" />
              </dl>
            </div>

            <div className="rounded-xl border border-slate-200">
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-slate-500" />
                  <h3 className="text-sm font-semibold text-slate-900">From Branches</h3>
                </div>
                <Link
                  href="/admin/branches"
                  className="inline-flex items-center gap-1 text-sm font-medium text-[#004C8F] hover:underline"
                >
                  Open Branches
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              {shared.branches.length === 0 ? (
                <p className="p-4 text-sm text-slate-500">No branches yet. Add them in Branches admin.</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {shared.branches.map((b) => (
                    <li key={b.name} className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium text-slate-900">{b.name}</p>
                        {b.isMain && (
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                            Flagship
                          </span>
                        )}
                        {!b.mapsUrl && (
                          <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-800">
                            Maps link missing
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-slate-600">{b.address}</p>
                      <p className="mt-0.5 text-xs text-slate-400">{b.hours || 'Hours not set'}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Sticky save */}
      <div className="sticky bottom-0 z-10 border-t border-slate-200 bg-white/95 px-6 py-3 backdrop-blur">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-h-[20px] text-sm">
            {error ? <span className="text-red-600">{error}</span> : null}
            {saved && !error ? <span className="text-emerald-600">Saved successfully.</span> : null}
            {!saved && !error ? (
              <span className="text-slate-500">Editing: {TABS.find((t) => t.id === tab)?.label}</span>
            ) : null}
          </div>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#E31B23] px-5 text-sm font-semibold text-white hover:bg-[#C8161D] disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>
    </form>
  )
}

const inputClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#004C8F] focus:ring-2 focus:ring-[#004C8F]/15'

function SectionIntro({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      <p className="mt-1 text-sm text-slate-500">{body}</p>
    </div>
  )
}

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
      {children}
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </div>
  )
}

function SharedCell({
  label,
  value,
  emptyHint,
}: {
  label: string
  value: string
  emptyHint?: string
}) {
  return (
    <div className="border-b border-slate-100 px-4 py-3 sm:border-r sm:odd:border-r sm:[&:nth-child(2n)]:border-r-0">
      <dt className="text-[11px] font-medium uppercase tracking-wider text-slate-400">{label}</dt>
      <dd className="mt-0.5 truncate text-sm font-medium text-slate-900">
        {value || <span className="font-normal text-slate-400">{emptyHint || 'Not set'}</span>}
      </dd>
    </div>
  )
}

function IconBtn({
  children,
  label,
  onClick,
  disabled,
  danger,
}: {
  children: React.ReactNode
  label: string
  onClick: () => void
  disabled?: boolean
  danger?: boolean
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-600 hover:bg-white disabled:opacity-30',
        danger && 'text-red-600 hover:bg-red-50'
      )}
    >
      {children}
    </button>
  )
}

function EmptyState({
  icon,
  title,
  actionLabel,
  onAction,
}: {
  icon: React.ReactNode
  title: string
  actionLabel: string
  onAction?: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 px-6 py-12 text-center">
      <div className="mb-3 text-slate-400">{icon}</div>
      <p className="text-sm font-medium text-slate-800">{title}</p>
      {onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="mt-3 text-sm font-medium text-[#004C8F] hover:underline"
        >
          {actionLabel}
        </button>
      ) : (
        <p className="mt-1 text-sm text-slate-500">{actionLabel}</p>
      )}
    </div>
  )
}
