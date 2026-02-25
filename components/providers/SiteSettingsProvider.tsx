'use client'

import React, { createContext, useContext } from 'react'

export type SiteSettings = {
  phone: string
  whatsapp: string
  email: string
  address: string
  hours: string
  site_url: string
  gst?: string
  logo_url: string
  favicon_url: string
}

const defaults: SiteSettings = {
  phone: '+91 9391026003',
  whatsapp: '919391026003',
  email: 'universalbatterieshyd@gmail.com',
  address: '2-4-78, M.G. Road, Secunderabad - 500003',
  hours: 'Mon-Sat: 9 AM - 7 PM, Sun: 10 AM - 4 PM',
  site_url: 'https://universalbatteries.co.in',
  gst: '',
  logo_url: '',
  favicon_url: '/favicon.svg',
}

const SiteSettingsContext = createContext<SiteSettings>(defaults)

export function SiteSettingsProvider({
  children,
  initialSettings,
}: {
  children: React.ReactNode
  initialSettings: Partial<SiteSettings>
}) {
  const settings = { ...defaults, ...initialSettings }
  return (
    <SiteSettingsContext.Provider value={settings}>
      {children}
    </SiteSettingsContext.Provider>
  )
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext)
}
