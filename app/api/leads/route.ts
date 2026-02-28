import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { sendLeadToGoogleSheets } from '@/lib/google-sheets-leads'

export type LeadType = 'battery_finder' | 'ups_proposal' | 'solar_enquiry' | 'contact' | 'enterprise'

/** Lead scoring: datacentre + >20 kVA = high, enterprise = high, etc. */
function computeLeadScore(type: string, source: string, payload: Record<string, unknown>): number {
  let score = 50
  if (type === 'enterprise' || source === 'enterprise') score += 25
  const orgType = String(payload.orgType || '').toLowerCase()
  if (orgType === 'datacentre') score += 20
  if (orgType === 'factory') score += 15
  if (orgType === 'clinic') score += 10
  const loadEstimate = String(payload.loadEstimate || payload.totalWatts || '').replace(/\D/g, '')
  const loadNum = parseInt(loadEstimate, 10) || 0
  if (loadNum >= 20000) score += 20
  else if (loadNum >= 10000) score += 15
  else if (loadNum >= 5000) score += 10
  if (payload.recommendedVa && (payload.recommendedVa as number) >= 5000) score += 10
  return Math.min(100, Math.max(0, score))
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, area, type, source, payload, website } = body

    if (website) {
      return NextResponse.json({ success: true }, { status: 200 })
    }

    if (!phone || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: phone, type' },
        { status: 400 }
      )
    }

    const validTypes: LeadType[] = ['battery_finder', 'ups_proposal', 'solar_enquiry', 'contact', 'enterprise']
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid lead type' },
        { status: 400 }
      )
    }

    const score = computeLeadScore(type, source || type, payload || {})

    const { error } = await supabase.from('leads').insert({
      phone,
      area: area || null,
      type,
      source: source || type,
      payload: payload || {},
      score,
    })

    if (error) {
      console.error('Lead submission error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }

    await sendLeadToGoogleSheets({
      source: (source || type) as 'battery_finder' | 'ups_proposal' | 'solar_enquiry' | 'contact' | 'enterprise' | 'power_backup_wizard' | 'general',
      phone,
      ...(typeof payload === 'object' ? payload : {}),
      extra: typeof payload === 'object' ? JSON.stringify(payload) : String(payload ?? ''),
    })

    return NextResponse.json(
      { success: true, message: 'Lead submitted successfully' },
      { status: 200 }
    )
  } catch (err) {
    console.error('Lead submission error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
