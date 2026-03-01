import { NextResponse } from 'next/server'
import { getSupabaseSession } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { toCamelCase } from '@/lib/db-utils'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSupabaseSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    const body = (await request.json()) as {
      name?: string
      slug?: string
      description?: string
      parentId?: string | null
      order?: number
      heroHeadline?: string
      heroTagline?: string
      heroImageUrl?: string
      cardImageUrl?: string | null
      overview?: string
      ctaHeadline?: string
      ctaSubtext?: string
      faqItems?: { question: string; answer: string }[]
      icon?: string
    }

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (body.name !== undefined) updates.name = body.name
    if (body.slug !== undefined) updates.slug = body.slug
    if (body.description !== undefined) updates.description = body.description
    if (body.parentId !== undefined) updates.parent_id = body.parentId
    if (body.order !== undefined) updates.order = body.order
    if (body.heroHeadline !== undefined) updates.hero_headline = body.heroHeadline
    if (body.heroTagline !== undefined) updates.hero_tagline = body.heroTagline
    if (body.heroImageUrl !== undefined) updates.hero_image_url = body.heroImageUrl
    if (body.cardImageUrl !== undefined) updates.card_image_url = body.cardImageUrl
    if (body.overview !== undefined) updates.overview = body.overview
    if (body.ctaHeadline !== undefined) updates.cta_headline = body.ctaHeadline
    if (body.ctaSubtext !== undefined) updates.cta_subtext = body.ctaSubtext
    if (body.faqItems !== undefined) updates.faq_items = body.faqItems
    if (body.icon !== undefined) updates.icon = body.icon

    const { data, error } = await supabase
      .from('product_category')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(toCamelCase(data))
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to update' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSupabaseSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const { error } = await supabase.from('product_category').delete().eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
