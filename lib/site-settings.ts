import { supabase } from '@/lib/supabase'

const DEFAULTS = {
  phone: '+91 9391026003',
  whatsapp: '919391026003',
  email: 'universalbatterieshyd@gmail.com',
  address: '2-4-78, M.G. Road, Secunderabad - 500003',
  gst: '',
  hours: 'Mon-Sat: 9 AM - 7 PM, Sun: 10 AM - 4 PM',
  site_url: process.env.NEXT_PUBLIC_SITE_URL || 'https://universalbatteries.co.in',
  logo_url: '',
  favicon_url: '/favicon.svg',
}

export type SiteSettings = typeof DEFAULTS

export async function getSiteSettings(): Promise<SiteSettings> {
  const { data, error } = await supabase.from('site_settings').select('key, value')
  if (error) return DEFAULTS
  const map = Object.fromEntries((data || []).map((r) => [r.key, r.value]))
  return {
    phone: map.phone || DEFAULTS.phone,
    whatsapp: map.whatsapp || DEFAULTS.whatsapp,
    email: map.email || DEFAULTS.email,
    address: map.address || DEFAULTS.address,
    gst: map.gst || DEFAULTS.gst,
    hours: map.hours || DEFAULTS.hours,
    site_url: map.site_url || DEFAULTS.site_url,
    logo_url: map.logo_url ?? DEFAULTS.logo_url,
    favicon_url: map.favicon_url || DEFAULTS.favicon_url,
  }
}
