import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { key, name, watts, emoji, iconUrl, showInVisual, order } = body

    const updates: Record<string, unknown> = {}
    if (key !== undefined) updates.key = key
    if (name !== undefined) updates.name = name
    if (watts !== undefined) updates.watts = watts
    if (emoji !== undefined) updates.emoji = emoji
    if (iconUrl !== undefined) updates.icon_url = iconUrl || null
    if (showInVisual !== undefined) updates.show_in_visual = showInVisual
    if (order !== undefined) updates.order = order

    const { data, error } = await supabase
      .from('appliance')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Appliance update error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }

    return NextResponse.json({
      id: data.id,
      key: data.key,
      name: data.name,
      watts: data.watts,
      emoji: data.emoji,
      iconUrl: data.icon_url,
      showInVisual: data.show_in_visual,
      order: data.order,
    })
  } catch (err) {
    console.error('Appliance update error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const { error } = await supabase.from('appliance').delete().eq('id', id)
    if (error) {
      console.error('Appliance delete error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Appliance delete error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
