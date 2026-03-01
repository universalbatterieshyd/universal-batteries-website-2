import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSupabaseSession } from '@/lib/auth'

export async function GET() {
  const { data, error } = await supabase
    .from('hero_content')
    .select('*')
    .eq('is_active', true)
    .order('order', { ascending: true })
    .limit(1)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return NextResponse.json(null)
    console.error('Hero fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const session = await getSupabaseSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { data, error } = await supabase
    .from('hero_content')
    .insert({
      headline: body.headline,
      subheadline: body.subheadline,
      cta_primary_text: body.ctaPrimaryText,
      cta_primary_link: body.ctaPrimaryLink,
      cta_secondary_text: body.ctaSecondaryText,
      cta_secondary_link: body.ctaSecondaryLink,
      background_image_url: body.backgroundImageUrl,
      tagline: body.tagline,
      cta_chips: body.ctaChips ?? null,
      is_active: body.isActive ?? true,
      order: body.order ?? 0,
    })
    .select()
    .single()

  if (error) {
    console.error('Hero create error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data)
}
