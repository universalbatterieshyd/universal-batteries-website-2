'use client'

import { useState } from 'react'

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
    favicon_url: initialSettings.favicon_url || '/favicon.svg',
  })
  const [saved, setSaved] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    })
    if (res.ok) {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl">
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Logo URL
          </label>
          <input
            type="text"
            value={settings.logo_url}
            onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })}
            placeholder="/logo.png or https://example.com/logo.png"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg"
          />
          <p className="text-xs text-gray-500 mt-1">
            Shown in navbar and footer. Leave empty for default battery icon. Use /filename for files in public folder.
          </p>
          {settings.logo_url && (
            <div className="mt-2 w-16 h-16 border border-gray-200 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={settings.logo_url}
                alt="Logo preview"
                className="max-w-full max-h-full object-contain"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Favicon URL
          </label>
          <input
            type="text"
            value={settings.favicon_url}
            onChange={(e) => setSettings({ ...settings, favicon_url: e.target.value })}
            placeholder="/favicon.svg or /favicon.ico"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg"
          />
          <p className="text-xs text-gray-500 mt-1">
            Browser tab icon. Default: /favicon.svg. Use /filename for files in public folder.
          </p>
          {settings.favicon_url && (
            <div className="mt-2 flex items-center gap-2">
              <div className="w-8 h-8 border border-gray-200 rounded overflow-hidden bg-gray-50 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={settings.favicon_url}
                  alt="Favicon preview"
                  className="max-w-full max-h-full object-contain w-6 h-6"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
              </div>
              <span className="text-xs text-gray-500">Preview</span>
            </div>
          )}
        </div>

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

        <div className="flex items-center gap-4">
          <button
            type="submit"
            className="px-6 py-2 bg-energy-red text-white rounded-lg hover:bg-[#C8161D] font-medium"
          >
            Save Settings
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
