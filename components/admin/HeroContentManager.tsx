'use client'

import { useState, useEffect } from 'react'

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
          <label className="block text-sm font-medium text-gray-700 mb-2">Tagline (e.g. Since 1971 • Trusted Power Solutions)</label>
          <input
            type="text"
            value={hero.tagline || ''}
            onChange={(e) => setHero({ ...hero, tagline: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Primary CTA Text</label>
            <input
              type="text"
              value={hero.cta_primary_text || ''}
              onChange={(e) => setHero({ ...hero, cta_primary_text: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              placeholder="WhatsApp Us"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Primary CTA Link (e.g. WhatsApp)</label>
            <input
              type="text"
              value={hero.cta_primary_link || ''}
              onChange={(e) => setHero({ ...hero, cta_primary_link: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              placeholder="https://wa.me/919391026003"
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
              placeholder="Call: +91 9391026003"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Secondary CTA Link (tel:)</label>
            <input
              type="text"
              value={hero.cta_secondary_link || ''}
              onChange={(e) => setHero({ ...hero, cta_secondary_link: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              placeholder="tel:+919391026003"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Background Image URL</label>
          <input
            type="text"
            value={hero.background_image_url || ''}
            onChange={(e) => setHero({ ...hero, background_image_url: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg"
            placeholder="/placeholder.svg or full URL"
          />
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
