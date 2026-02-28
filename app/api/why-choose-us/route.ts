import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSupabaseSession } from '@/lib/auth'
import { toCamelCase, toCamelCaseArray } from '@/lib/db-utils'

export async function GET() {
  const { data, error } = await supabase
    .from('why_choose_us')
    .select('*')
    .order('order', { ascending: true })

  if (error) {
    console.error('Why choose us fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }

  return NextResponse.json(toCamelCaseArray(data || []))
}

export async function PUT(request: NextRequest) {
  const session = await getSupabaseSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const items = body.items as { id?: string; title: string; description: string; icon: string; order: number }[]

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Items array required' }, { status: 400 })
    }

    await supabase.from('why_choose_us').delete().neq('id', '')
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      await supabase.from('why_choose_us').insert({
        title: item.title,
        description: item.description,
        icon: item.icon || 'Shield',
        order: i,
      })
    }

    const { data } = await supabase
      .from('why_choose_us')
      .select('*')
      .order('order', { ascending: true })

    return NextResponse.json(toCamelCaseArray(data || []))
  } catch (err) {
    console.error('Why choose us update error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
