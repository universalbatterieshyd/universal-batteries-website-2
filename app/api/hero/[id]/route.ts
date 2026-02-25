import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSupabaseSession } from '@/lib/auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSupabaseSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (body.headline !== undefined) update.headline = body.headline
  if (body.subheadline !== undefined) update.subheadline = body.subheadline
  if (body.ctaPrimaryText !== undefined) update.cta_primary_text = body.ctaPrimaryText
  if (body.ctaPrimaryLink !== undefined) update.cta_primary_link = body.ctaPrimaryLink
  if (body.ctaSecondaryText !== undefined) update.cta_secondary_text = body.ctaSecondaryText
  if (body.ctaSecondaryLink !== undefined) update.cta_secondary_link = body.ctaSecondaryLink
  if (body.backgroundImageUrl !== undefined) update.background_image_url = body.backgroundImageUrl
  if (body.tagline !== undefined) update.tagline = body.tagline
  if (body.isActive !== undefined) update.is_active = body.isActive
  if (body.order !== undefined) update.order = body.order

  const { data, error } = await supabase
    .from('hero_content')
    .update(update)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Hero update error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSupabaseSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const { error } = await supabase.from('hero_content').delete().eq('id', id)
  if (error) {
    console.error('Hero delete error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ success: true })
}
