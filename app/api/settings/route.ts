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
    return NextResponse.json({ error: 'Unauthorized. Please log in again.' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const keys = ['phone', 'whatsapp', 'email', 'address', 'gst', 'hours', 'site_url', 'logo_url', 'logo_light_horizontal', 'logo_light_vertical', 'logo_dark_horizontal', 'logo_dark_vertical', 'favicon_url']

  for (const key of keys) {
    if (body[key] !== undefined) {
      const { error } = await supabase.from('site_settings').upsert(
        { key, value: String(body[key] ?? ''), updated_at: new Date().toISOString() },
        { onConflict: 'key' }
      )
      if (error) {
        console.error('Settings upsert error:', key, error)
        return NextResponse.json(
          { error: `Failed to save ${key}: ${error.message}` },
          { status: 500 }
        )
      }
    }
  }

  const { data, error } = await supabase.from('site_settings').select('key, value')
  if (error) {
    console.error('Settings fetch after save:', error)
    return NextResponse.json({ error: 'Saved but failed to refresh' }, { status: 500 })
  }
  const map = Object.fromEntries((data || []).map((row) => [row.key, row.value]))
  return NextResponse.json(map)
}
