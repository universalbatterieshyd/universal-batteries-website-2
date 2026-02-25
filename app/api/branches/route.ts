import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSupabaseSession } from '@/lib/auth'
import { toCamelCase } from '@/lib/db-utils'

export async function GET() {
  const { data, error } = await supabase
    .from('branch')
    .select('*')
    .order('is_main', { ascending: false })
    .order('order', { ascending: true })
    .order('name', { ascending: true })

  if (error) {
    console.error('Branches fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }

  const branches = (data || []).map((row) => toCamelCase(row))
  return NextResponse.json(branches)
}

export async function POST(request: NextRequest) {
  const session = await getSupabaseSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { name, address, phone, email, hours, manager, mapsUrl, isMain, order } = body

    if (!name || !address || !phone) {
      return NextResponse.json(
        { error: 'Name, address, and phone are required' },
        { status: 400 }
      )
    }

    const { data: branch, error } = await supabase
      .from('branch')
      .insert({
        name,
        address,
        phone,
        email: email || null,
        hours: hours || null,
        manager: manager || null,
        maps_url: mapsUrl || null,
        is_main: isMain ?? false,
        order: order ?? 0,
      })
      .select()
      .single()

    if (error) {
      console.error('Branch create error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }

    return NextResponse.json(toCamelCase(branch))
  } catch (error) {
    console.error('Branch create error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
