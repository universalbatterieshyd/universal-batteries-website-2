import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSupabaseSession } from '@/lib/auth'

export async function GET() {
  const { data, error } = await supabase.from('site_settings').select('key, value')

  if (error) {
    console.error('Settings fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }

  const map = Object.fromEntries((data || []).map((row) => [row.key, row.value]))
  return NextResponse.json(map)
}

export async function PUT(request: NextRequest) {
  const session = await getSupabaseSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const keys = ['phone', 'whatsapp', 'email', 'address', 'gst', 'hours', 'site_url', 'logo_url', 'logo_light_horizontal', 'logo_light_vertical', 'logo_dark_horizontal', 'logo_dark_vertical', 'favicon_url']

  for (const key of keys) {
    if (body[key] !== undefined) {
      await supabase.from('site_settings').upsert(
        { key, value: String(body[key]), updated_at: new Date().toISOString() },
        { onConflict: 'key' }
      )
    }
  }

  const { data } = await supabase.from('site_settings').select('key, value')
  const map = Object.fromEntries((data || []).map((row) => [row.key, row.value]))
  return NextResponse.json(map)
}
