import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getQuoteProfile, isQuoteAdmin } from '@/lib/quotes/auth'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const profile = await getQuoteProfile()
  if (!isQuoteAdmin(profile)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = params
  const body = await request.json()
  const patch: Record<string, unknown> = {}
  if (body.name !== undefined) patch.name = body.name
  if (body.slug !== undefined) patch.slug = body.slug
  if (body.gst_percent !== undefined) patch.gst_percent = body.gst_percent
  if (body.parent_id !== undefined) patch.parent_id = body.parent_id
  if (body.is_active !== undefined) patch.is_active = body.is_active

  const supabase = await createClient()
  const { error } = await supabase.from('quote_categories').update(patch).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const profile = await getQuoteProfile()
  if (!isQuoteAdmin(profile)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = params
  const supabase = await createClient()
  const { error } = await supabase.from('quote_categories').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
