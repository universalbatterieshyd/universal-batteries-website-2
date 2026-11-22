/**
 * Server-only company profile data loading. Do not import from client components.
 */

import { supabase } from '@/lib/supabase'
import { getSiteSettings } from '@/lib/site-settings'
import { toCamelCaseArray } from '@/lib/db-utils'
import type { Branch } from '@/types/db'
import {
  fallbackBranches,
  mergeProfileOverrides,
  parseCompanyProfileOverrides,
  toTelHref,
  toWhatsappDigits,
  type CompanyProfileOverrides,
  type ProfileBranch,
  type ResolvedCompanyProfile,
} from '@/lib/company-profile'

function mapBranches(rows: Branch[], hoursFallback: string, addressFallback: string): ProfileBranch[] {
  if (!rows.length) return fallbackBranches(addressFallback, hoursFallback)
  return rows.map((b) => ({
    id: b.id,
    name: b.name,
    badge: b.isMain ? 'Flagship' : 'Branch',
    address: b.address,
    hours: b.hours?.trim() || hoursFallback,
    mapsUrl: b.mapsUrl?.trim() || '',
    isMain: b.isMain,
  }))
}

export async function getCompanyProfileOverrides(): Promise<CompanyProfileOverrides> {
  const { data } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'company_profile')
    .maybeSingle()
  return mergeProfileOverrides(parseCompanyProfileOverrides(data?.value))
}

export async function getResolvedCompanyProfile(): Promise<ResolvedCompanyProfile> {
  const [settings, overrides, branchRes] = await Promise.all([
    getSiteSettings(),
    getCompanyProfileOverrides(),
    supabase
      .from('branch')
      .select('*')
      .order('is_main', { ascending: false })
      .order('order', { ascending: true })
      .order('name', { ascending: true }),
  ])

  const branches = toCamelCaseArray<Branch>(branchRes.data || [])
  const logoUrl =
    settings.logo_dark_horizontal ||
    settings.logo_dark_vertical ||
    settings.logo_light_horizontal ||
    settings.logo_url ||
    ''

  return {
    ...overrides,
    deskPhoneDisplay: settings.phone,
    deskPhoneTel: toTelHref(settings.phone),
    whatsappNumber: toWhatsappDigits(settings.whatsapp),
    email: settings.email,
    gstin: settings.gst?.trim() || '',
    websiteUrl: settings.site_url || 'https://universalbatteries.co.in',
    logoUrl,
    hoursFallback: settings.hours,
    addressFallback: settings.address,
    branches: mapBranches(branches, settings.hours, settings.address),
  }
}
