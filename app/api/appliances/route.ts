import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { key, name, watts, emoji, showInVisual, order } = body

    if (!key || !name || watts == null) {
      return NextResponse.json(
        { error: 'Missing required fields: key, name, watts' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('appliance')
      .insert({
        key,
        name,
        watts: Number(watts),
        emoji: emoji || '📦',
        show_in_visual: showInVisual !== false,
        order: order ?? 0,
      })
      .select()
      .single()

    if (error) {
      console.error('Appliance create error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }

    return NextResponse.json({
      id: data.id,
      key: data.key,
      name: data.name,
      watts: data.watts,
      emoji: data.emoji,
      showInVisual: data.show_in_visual,
      order: data.order,
    })
  } catch (err) {
    console.error('Appliance create error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  const { data, error } = await supabase
    .from('appliance')
    .select('id, key, name, watts, emoji, show_in_visual, order')
    .order('order', { ascending: true })

  if (error) {
    console.error('Appliances fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }

  return NextResponse.json(data || [])
}
