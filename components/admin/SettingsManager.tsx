'use client'

import { useState } from 'react'
import { ImageUploadField } from './ImageUploadField'

export function SettingsManager({
  initialSettings,
}: {
  initialSettings: Record<string, string>
}) {
  const [settings, setSettings] = useState({
    phone: initialSettings.phone || '',
    whatsapp: initialSettings.whatsapp || '',
    email: initialSettings.email || '',
    address: initialSettings.address || '',
    gst: initialSettings.gst || '',
    hours: initialSettings.hours || '',
    site_url: initialSettings.site_url || '',
    logo_url: initialSettings.logo_url || '',
    logo_light_horizontal: initialSettings.logo_light_horizontal || initialSettings.logo_url || '',
    logo_light_vertical: initialSettings.logo_light_vertical || '',
    logo_dark_horizontal: initialSettings.logo_dark_horizontal || '',
    logo_dark_vertical: initialSettings.logo_dark_vertical || '',
    favicon_url: initialSettings.favicon_url || '/favicon.svg',
  })
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      const data = await res.json()
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      } else {
        setError(data?.error || `Save failed (${res.status})`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl">
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        <p className="text-sm text-gray-600 mb-4">
          Use logos that contrast with the background. Light backgrounds (navbar) = black text. Dark backgrounds (footer, admin) = white text.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <ImageUploadField
            label="Logo – light bg, horizontal"
            value={settings.logo_light_horizontal}
            onChange={(v) => setSettings({ ...settings, logo_light_horizontal: v, logo_url: v })}
            type="logo"
            placeholder="/logo-horizontal-black.png"
            previewSize="md"
          />
          <ImageUploadField
            label="Logo – light bg, vertical"
            value={settings.logo_light_vertical}
            onChange={(v) => setSettings({ ...settings, logo_light_vertical: v })}
            type="logo"
            placeholder="/logo-vertical-black.png"
            previewSize="tall"
          />
          <ImageUploadField
            label="Logo – dark bg, horizontal"
            value={settings.logo_dark_horizontal}
            onChange={(v) => setSettings({ ...settings, logo_dark_horizontal: v })}
            type="logo"
            placeholder="/logo-horizontal-white.png"
            previewSize="md"
          />
          <ImageUploadField
            label="Logo – dark bg, vertical"
            value={settings.logo_dark_vertical}
            onChange={(v) => setSettings({ ...settings, logo_dark_vertical: v })}
            type="logo"
            placeholder="/logo-vertical-white.png"
            previewSize="tall"
          />
        </div>

        <ImageUploadField
          label="Favicon"
          value={settings.favicon_url}
          onChange={(v) => setSettings({ ...settings, favicon_url: v })}
          type="favicon"
          placeholder="/favicon.png"
          previewSize="sm"
        />

        <hr className="border-gray-200" />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Phone
          </label>
          <input
            type="text"
            value={settings.phone}
            onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
            placeholder="+91-XXXXXXXXXX"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg"
          />
          <p className="text-xs text-gray-500 mt-1">
            Shown on website header, footer, and CTAs
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            WhatsApp Number
          </label>
          <input
            type="text"
            value={settings.whatsapp}
            onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
            placeholder="91XXXXXXXXXX (no + or spaces)"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg"
          />
          <p className="text-xs text-gray-500 mt-1">
            Used for WhatsApp click-to-chat links
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Address
          </label>
          <textarea
            value={settings.address}
            onChange={(e) => setSettings({ ...settings, address: e.target.value })}
            rows={2}
            placeholder="2-4-78, M.G. Road, Secunderabad - 500003"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg"
          />
          <p className="text-xs text-gray-500 mt-1">
            Shown in footer and contact section
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contact Email
          </label>
          <input
            type="email"
            value={settings.email}
            onChange={(e) => setSettings({ ...settings, email: e.target.value })}
            placeholder="info@universalbatteries.com"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            GST Number (optional)
          </label>
          <input
            type="text"
            value={settings.gst}
            onChange={(e) => setSettings({ ...settings, gst: e.target.value })}
            placeholder="29XXXXX1234X1ZX"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Hours
          </label>
          <input
            type="text"
            value={settings.hours}
            onChange={(e) => setSettings({ ...settings, hours: e.target.value })}
            placeholder="Mon-Sat: 9 AM - 7 PM, Sun: 10 AM - 4 PM"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg"
          />
          <p className="text-xs text-gray-500 mt-1">
            Shown in footer and contact page
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Site URL
          </label>
          <input
            type="url"
            value={settings.site_url}
            onChange={(e) => setSettings({ ...settings, site_url: e.target.value })}
            placeholder="https://universalbatteries.co.in"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg"
          />
          <p className="text-xs text-gray-500 mt-1">
            Used for SEO and canonical links
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 text-red-700 px-4 py-3 text-sm">
            {error}
          </div>
        )}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-energy-red text-white rounded-lg hover:bg-[#C8161D] font-medium disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
          {saved && (
            <span className="text-green-600 text-sm font-medium">Saved!</span>
          )}
        </div>
      </div>

      <p className="mt-6 text-sm text-gray-500">
        Changes here update the site immediately. No need to redeploy or edit environment variables.
      </p>
    </form>
  )
}
