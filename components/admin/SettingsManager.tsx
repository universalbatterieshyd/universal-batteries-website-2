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
    logo_light_horizontal: initialSettings.logo_light_horizontal || initialSettings.logo_url || '',
    logo_light_vertical: initialSettings.logo_light_vertical || '',
    logo_dark_horizontal: initialSettings.logo_dark_horizontal || '',
    logo_dark_vertical: initialSettings.logo_dark_vertical || '',
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
        <p className="text-sm text-gray-600 mb-4">
          Use logos that contrast with the background. Light backgrounds (navbar) = black text. Dark backgrounds (footer, admin) = white text.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Logo – light bg, horizontal</label>
            <input
              type="text"
              value={settings.logo_light_horizontal}
              onChange={(e) => setSettings({ ...settings, logo_light_horizontal: e.target.value, logo_url: e.target.value })}
              placeholder="/logo-horizontal-black.png"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
            />
            <p className="text-xs text-gray-500 mt-1">Navbar (light glass background)</p>
            {settings.logo_light_horizontal && (
              <div className="mt-2 w-24 h-12 border border-gray-200 rounded-lg overflow-hidden bg-white flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={settings.logo_light_horizontal} alt="" className="max-w-full max-h-full object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Logo – light bg, vertical</label>
            <input
              type="text"
              value={settings.logo_light_vertical}
              onChange={(e) => setSettings({ ...settings, logo_light_vertical: e.target.value })}
              placeholder="/logo-vertical-black.png"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
            />
            <p className="text-xs text-gray-500 mt-1">Narrow light areas (optional)</p>
            {settings.logo_light_vertical && (
              <div className="mt-2 w-12 h-24 border border-gray-200 rounded-lg overflow-hidden bg-white flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={settings.logo_light_vertical} alt="" className="max-w-full max-h-full object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Logo – dark bg, horizontal</label>
            <input
              type="text"
              value={settings.logo_dark_horizontal}
              onChange={(e) => setSettings({ ...settings, logo_dark_horizontal: e.target.value })}
              placeholder="/logo-horizontal-white.png"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
            />
            <p className="text-xs text-gray-500 mt-1">Footer (dark background)</p>
            {settings.logo_dark_horizontal && (
              <div className="mt-2 w-24 h-12 border border-gray-200 rounded-lg overflow-hidden bg-slate-800 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={settings.logo_dark_horizontal} alt="" className="max-w-full max-h-full object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Logo – dark bg, vertical</label>
            <input
              type="text"
              value={settings.logo_dark_vertical}
              onChange={(e) => setSettings({ ...settings, logo_dark_vertical: e.target.value })}
              placeholder="/logo-vertical-white.png"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
            />
            <p className="text-xs text-gray-500 mt-1">Admin sidebar (optional)</p>
            {settings.logo_dark_vertical && (
              <div className="mt-2 w-12 h-24 border border-gray-200 rounded-lg overflow-hidden bg-slate-800 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={settings.logo_dark_vertical} alt="" className="max-w-full max-h-full object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Favicon URL</label>
          <input
            type="text"
            value={settings.favicon_url}
            onChange={(e) => setSettings({ ...settings, favicon_url: e.target.value })}
            placeholder="/favicon.png or /favicon.ico"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg"
          />
          <p className="text-xs text-gray-500 mt-1">Browser tab icon. Use /favicon.png for PNG.</p>
          {settings.favicon_url && (
            <div className="mt-2 flex items-center gap-2">
              <div className="w-8 h-8 border border-gray-200 rounded overflow-hidden bg-gray-50 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={settings.favicon_url} alt="" className="max-w-full max-h-full object-contain w-6 h-6" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
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
