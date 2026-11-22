/**
 * Company Profile (QR dossier) — types, defaults, and client-safe helpers.
 * Server fetch lives in lib/company-profile-data.ts (do not import that from client components).
 */

export type ProfileCapability = {
  title: string
  description: string
  /** Optional card image — title stays for SEO when image is set */
  imageUrl?: string
}

export type ProfileBrand = {
  name: string
  /** Optional logo — name stays for SEO when logo is set */
  logoUrl?: string
}

export type ProfileBranch = {
  id: string
  name: string
  badge?: string
  address: string
  hours: string
  mapsUrl: string
  isMain: boolean
}

/** Profile-only fields editable at /admin/company-profile */
export type CompanyProfileOverrides = {
  companyName: string
  establishedYear: string
  tagline: string
  whatsappPrefill: string
  legalFirmName: string
  companyProfilePdfUrl: string
  capabilities: ProfileCapability[]
  brands: ProfileBrand[]
}

export type ResolvedCompanyProfile = CompanyProfileOverrides & {
  deskPhoneDisplay: string
  deskPhoneTel: string
  whatsappNumber: string
  email: string
  gstin: string
  websiteUrl: string
  logoUrl: string
  hoursFallback: string
  addressFallback: string
  branches: ProfileBranch[]
}

export const DEFAULT_CAPABILITIES: ProfileCapability[] = [
  {
    title: 'Automotive & Genset',
    description: '2W, 4W, Commercial & DG Starting Batteries',
  },
  {
    title: 'UPS & Critical Power',
    description: 'Home Inverters, Online UPS (up to 600 kVA), SMF & Tubular Banks',
  },
  {
    title: 'Solar & Hybrid',
    description: 'Grid-Tied, Off-Grid & Commercial Systems (up to 30 kW)',
  },
  {
    title: 'Lithium & Technical Services',
    description: 'LiFePO4 / EV, Diagnostics, Installation, Commissioning, Repair & Buyback',
  },
]

export const DEFAULT_BRANDS: ProfileBrand[] = [
  { name: 'Exide' },
  { name: 'Amaron' },
  { name: 'APC' },
  { name: 'Luminous' },
  { name: 'Microtek' },
  { name: 'Rocket' },
  { name: 'Chloride Safepower' },
  { name: 'Powersafe Plus' },
]

export const DEFAULT_COMPANY_PROFILE: CompanyProfileOverrides = {
  companyName: 'Universal Batteries',
  establishedYear: '1992',
  tagline: 'Power Backup, Battery & Solar Solutions · Secunderabad',
  whatsappPrefill: 'Hi Universal Batteries, reaching out via your business card.',
  legalFirmName: '',
  companyProfilePdfUrl: '',
  capabilities: DEFAULT_CAPABILITIES,
  brands: DEFAULT_BRANDS,
}

/** E.164-ish tel: value from a display phone string. */
export function toTelHref(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, '')
  if (digits.startsWith('+')) return digits
  if (digits.startsWith('91') && digits.length >= 12) return `+${digits}`
  if (digits.length === 10) return `+91${digits}`
  return digits ? `+${digits}` : ''
}

/** Digits-only WhatsApp number (no +). */
export function toWhatsappDigits(whatsapp: string): string {
  return whatsapp.replace(/\D/g, '')
}

export function parseCompanyProfileOverrides(raw: string | undefined | null): Partial<CompanyProfileOverrides> {
  if (!raw?.trim()) return {}
  try {
    const parsed = JSON.parse(raw) as Partial<CompanyProfileOverrides>
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function normalizeBrand(raw: unknown): ProfileBrand | null {
  if (typeof raw === 'string') {
    const name = raw.trim()
    return name ? { name } : null
  }
  if (raw && typeof raw === 'object') {
    const row = raw as { name?: unknown; logoUrl?: unknown }
    const name = String(row.name || '').trim()
    if (!name) return null
    const logoUrl = String(row.logoUrl || '').trim()
    return logoUrl ? { name, logoUrl } : { name }
  }
  return null
}

function normalizeCapability(raw: unknown): ProfileCapability | null {
  if (!raw || typeof raw !== 'object') return null
  const row = raw as { title?: unknown; description?: unknown; imageUrl?: unknown }
  const title = String(row.title || '').trim()
  if (!title) return null
  const description = String(row.description || '').trim()
  const imageUrl = String(row.imageUrl || '').trim()
  return {
    title,
    description,
    ...(imageUrl ? { imageUrl } : {}),
  }
}

export function mergeProfileOverrides(
  stored: Partial<CompanyProfileOverrides> | null | undefined
): CompanyProfileOverrides {
  const s = stored || {}
  const capabilities =
    Array.isArray(s.capabilities) && s.capabilities.length > 0
      ? s.capabilities.map(normalizeCapability).filter((c): c is ProfileCapability => Boolean(c))
      : DEFAULT_CAPABILITIES

  const brands =
    Array.isArray(s.brands) && s.brands.length > 0
      ? (s.brands as unknown[]).map(normalizeBrand).filter((b): b is ProfileBrand => Boolean(b))
      : DEFAULT_BRANDS

  return {
    companyName: String(s.companyName || DEFAULT_COMPANY_PROFILE.companyName).trim() || DEFAULT_COMPANY_PROFILE.companyName,
    establishedYear: String(s.establishedYear || DEFAULT_COMPANY_PROFILE.establishedYear).trim() || '1992',
    tagline: String(s.tagline || DEFAULT_COMPANY_PROFILE.tagline).trim() || DEFAULT_COMPANY_PROFILE.tagline,
    whatsappPrefill:
      String(s.whatsappPrefill || DEFAULT_COMPANY_PROFILE.whatsappPrefill).trim() ||
      DEFAULT_COMPANY_PROFILE.whatsappPrefill,
    legalFirmName: String(s.legalFirmName || '').trim(),
    companyProfilePdfUrl: String(s.companyProfilePdfUrl || '').trim(),
    capabilities: capabilities.length ? capabilities : DEFAULT_CAPABILITIES,
    brands: brands.length ? brands : DEFAULT_BRANDS,
  }
}

export function fallbackBranches(address: string, hours: string): ProfileBranch[] {
  return [
    {
      id: 'fallback-mg',
      name: 'M.G. Road — Flagship Store',
      badge: 'Flagship',
      address: address || '2-4-78, M.G. Road, Secunderabad – 500 003, Telangana',
      hours: hours || 'Mon–Sat · 9:00 AM – 7:00 PM',
      mapsUrl: '',
      isMain: true,
    },
    {
      id: 'fallback-kk',
      name: 'Karkhana Branch',
      badge: 'Branch',
      address: 'Karkhana, Secunderabad',
      hours: hours || 'Mon–Sat · 9:00 AM – 7:00 PM',
      mapsUrl: '',
      isMain: false,
    },
  ]
}

/** Build a vCard 3.0 string — company desk only, no personal names. */
export function buildCompanyVCard(profile: ResolvedCompanyProfile): string {
  const main = profile.branches.find((b) => b.isMain) || profile.branches[0]
  const street = main?.address || profile.addressFallback || ''
  const escape = (s: string) =>
    s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')

  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${escape(profile.companyName)}`,
    `ORG:${escape(profile.companyName)}`,
  ]
  if (profile.deskPhoneTel) {
    lines.push(`TEL;TYPE=WORK,VOICE:${profile.deskPhoneTel}`)
  }
  if (profile.email) {
    lines.push(`EMAIL;TYPE=WORK:${escape(profile.email)}`)
  }
  if (profile.websiteUrl) {
    lines.push(`URL:${escape(profile.websiteUrl)}`)
  }
  if (street) {
    lines.push(`ADR;TYPE=WORK:;;${escape(street)};Secunderabad;Telangana;500003;India`)
  }
  lines.push('END:VCARD')
  return lines.join('\r\n')
}
