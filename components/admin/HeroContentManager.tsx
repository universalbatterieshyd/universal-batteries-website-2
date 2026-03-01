'use client'

import { useState, useEffect } from 'react'
import { ImageUploadField } from './ImageUploadField'

type HeroChip = {
  label: string
  href: string
  icon: string
  image_url?: string | null
}

const DEFAULT_CTA_CHIPS: HeroChip[] = [
  { label: "Need home backup or solar?", href: "/solutions/home-backup", icon: "Home" },
  { label: "Running an office, clinic or datacentre?", href: "/solutions/office-ups", icon: "Building2" },
  { label: "Looking for a battery replacement?", href: "/solutions/home-backup#battery-finder", icon: "Battery" },
  { label: "View Products", href: "/#products", icon: "Package" },
]

type HeroContent = {
  id: string
  headline: string
  subheadline: string | null
  cta_primary_text: string | null
  cta_primary_link: string | null
  cta_secondary_text: string | null
  cta_secondary_link: string | null
  background_image_url: string | null
  tagline: string | null
  cta_chips?: HeroChip[] | null
  is_active: boolean
  order: number
}

export function HeroContentManager({ initialData }: { initialData: HeroContent | null }) {
  const [hero, setHero] = useState<HeroContent | null>(initialData)
  const [loading, setLoading] = useState(!initialData)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!initialData) {
      fetch('/api/hero')
        .then((r) => r.json())
        .then((d) => { setHero(d); setLoading(false) })
        .catch(() => setLoading(false))
    }
  }, [initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!hero) return
    setSaving(true)
    const res = await fetch(`/api/hero/${hero.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        headline: hero.headline,
        subheadline: hero.subheadline,
        ctaPrimaryText: hero.cta_primary_text,
        ctaPrimaryLink: hero.cta_primary_link,
        ctaSecondaryText: hero.cta_secondary_text,
        ctaSecondaryLink: hero.cta_secondary_link,
        backgroundImageUrl: hero.background_image_url,
        tagline: hero.tagline,
        ctaChips: hero.cta_chips ?? DEFAULT_CTA_CHIPS,
        isActive: hero.is_active,
      }),
    })
    setSaving(false)
    if (res.ok) {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  if (loading) return <p className="text-gray-500">Loading...</p>
  if (!hero) return <p className="text-amber-600">No hero content found. Run the Supabase migration (supabase/migrations/002_hero_content_and_extensions.sql) to create the hero_content table.</p>

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Headline</label>
          <input
            type="text"
            value={hero.headline}
            onChange={(e) => setHero({ ...hero, headline: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg"
            placeholder="Powering Homes, Businesses & Industries"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Subheadline</label>
          <textarea
            value={hero.subheadline || ''}
            onChange={(e) => setHero({ ...hero, subheadline: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg"
            placeholder="Your trusted partner for genuine batteries..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tagline (e.g. Since 1992 • Trusted Power Solutions)</label>
          <input
            type="text"
            value={hero.tagline || ''}
            onChange={(e) => setHero({ ...hero, tagline: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg"
          />
        </div>
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
          Note: Contact details (WhatsApp, phone) are only shown in the Footer and Contact Us section. Hero CTAs should link to internal pages.
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Primary CTA Text</label>
            <input
              type="text"
              value={hero.cta_primary_text || ''}
              onChange={(e) => setHero({ ...hero, cta_primary_text: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              placeholder="View Products"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Primary CTA Link (internal)</label>
            <input
              type="text"
              value={hero.cta_primary_link || ''}
              onChange={(e) => setHero({ ...hero, cta_primary_link: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              placeholder="#products or /categories/automotive"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Secondary CTA Text</label>
            <input
              type="text"
              value={hero.cta_secondary_text || ''}
              onChange={(e) => setHero({ ...hero, cta_secondary_text: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              placeholder="Our Services"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Secondary CTA Link (internal)</label>
            <input
              type="text"
              value={hero.cta_secondary_link || ''}
              onChange={(e) => setHero({ ...hero, cta_secondary_link: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              placeholder="#services or /about"
            />
          </div>
        </div>
        <ImageUploadField
          label="Hero background image"
          value={hero.background_image_url || ''}
          onChange={(v) => setHero({ ...hero, background_image_url: v })}
          type="hero"
          placeholder="Upload or paste URL"
          previewSize="lg"
        />
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-base font-semibold text-gray-900 mb-2">Hero category chips</h3>
          <p className="text-sm text-gray-600 mb-4">Optional background images (400×400px recommended). Leave empty for solid red.</p>
          <div className="space-y-4">
            {(hero.cta_chips ?? DEFAULT_CTA_CHIPS).map((chip, i) => {
              const chips = hero.cta_chips ?? DEFAULT_CTA_CHIPS
              const setChip = (updates: Partial<HeroChip>) => {
                const next = [...chips]
                next[i] = { ...next[i], ...updates }
                setHero({ ...hero, cta_chips: next })
              }
              return (
                <div key={i} className="rounded-lg border border-gray-200 p-4 bg-gray-50/50 space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-gray-700">Chip {i + 1}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Label</label>
                      <input
                        type="text"
                        value={chip.label}
                        onChange={(e) => setChip({ label: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Link</label>
                      <input
                        type="text"
                        value={chip.href}
                        onChange={(e) => setChip({ href: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="/solutions/home-backup"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Background image (400×400px)</label>
                    <ImageUploadField
                      value={chip.image_url || ''}
                      onChange={(v) => setChip({ image_url: v })}
                      type="chip"
                      placeholder="Upload or paste URL"
                      previewSize="md"
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is_active"
            checked={hero.is_active}
            onChange={(e) => setHero({ ...hero, is_active: e.target.checked })}
            className="rounded border-gray-300"
          />
          <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
            Visible on homepage
          </label>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
        {saved && <span className="text-green-600 text-sm">Saved!</span>}
      </div>
    </form>
  )
}
