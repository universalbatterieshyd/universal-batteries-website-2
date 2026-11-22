import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSupabaseSession } from '@/lib/auth'
import {
  DEFAULT_BRANDS,
  DEFAULT_CAPABILITIES,
  mergeProfileOverrides,
  type CompanyProfileOverrides,
  type ProfileBrand,
  type ProfileCapability,
} from '@/lib/company-profile'
import { getCompanyProfileOverrides } from '@/lib/company-profile-data'

function sanitizeBody(body: Record<string, unknown>): CompanyProfileOverrides {
  const capabilitiesRaw = Array.isArray(body.capabilities) ? body.capabilities : []
  const capabilities: ProfileCapability[] = capabilitiesRaw
    .map((c) => {
      const row = c as { title?: unknown; description?: unknown; imageUrl?: unknown }
      const title = String(row.title || '').trim().slice(0, 80)
      if (!title) return null
      const description = String(row.description || '').trim().slice(0, 200)
      const imageUrl = String(row.imageUrl || '').trim().slice(0, 500)
      return {
        title,
        description,
        ...(imageUrl ? { imageUrl } : {}),
      }
    })
    .filter((c): c is ProfileCapability => Boolean(c))
    .slice(0, 8)

  const brands: ProfileBrand[] = []
  for (const b of Array.isArray(body.brands) ? body.brands : []) {
    if (brands.length >= 24) break
    if (typeof b === 'string') {
      const name = b.trim().slice(0, 60)
      if (name) brands.push({ name })
      continue
    }
    const row = b as { name?: unknown; logoUrl?: unknown }
    const name = String(row.name || '').trim().slice(0, 60)
    if (!name) continue
    const logoUrl = String(row.logoUrl || '').trim().slice(0, 500)
    brands.push(logoUrl ? { name, logoUrl } : { name })
  }

  return mergeProfileOverrides({
    companyName: String(body.companyName || '').trim().slice(0, 80),
    establishedYear: String(body.establishedYear || '').trim().slice(0, 4),
    tagline: String(body.tagline || '').trim().slice(0, 160),
    whatsappPrefill: String(body.whatsappPrefill || '').trim().slice(0, 280),
    legalFirmName: String(body.legalFirmName || '').trim().slice(0, 160),
    companyProfilePdfUrl: String(body.companyProfilePdfUrl || '').trim().slice(0, 500),
    capabilities: capabilities.length ? capabilities : DEFAULT_CAPABILITIES,
    brands: brands.length ? brands : DEFAULT_BRANDS,
  })
}

export async function GET() {
  const profile = await getCompanyProfileOverrides()
  return NextResponse.json(profile)
}

export async function PUT(request: NextRequest) {
  const session = await getSupabaseSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized. Please log in again.' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const profile = sanitizeBody(body)
  const { error } = await supabase.from('site_settings').upsert(
    {
      key: 'company_profile',
      value: JSON.stringify(profile),
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'key' }
  )

  if (error) {
    console.error('Company profile save error:', error)
    return NextResponse.json({ error: error.message || 'Failed to save' }, { status: 500 })
  }

  return NextResponse.json(profile)
}
