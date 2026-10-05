import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getQuoteProfile, isQuoteAdmin } from '@/lib/quotes/auth'

export async function POST(request: Request) {
  const profile = await getQuoteProfile()
  if (!isQuoteAdmin(profile)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const name = String(body.name || '').trim()
  const slug = String(body.slug || '').trim()
  if (!name || !slug) {
    return NextResponse.json({ error: 'Name and slug required' }, { status: 400 })
  }

  const supabase = await createClient()
  const parent_id = body.parent_id || null

  const { data: siblings } = await supabase
    .from('quote_categories')
    .select('sort_order')
    .is('parent_id', parent_id)
    .order('sort_order', { ascending: false })
    .limit(1)

  const sort_order = (siblings?.[0]?.sort_order ?? -1) + 1

  const { data, error } = await supabase
    .from('quote_categories')
    .insert({
      name,
      slug,
      parent_id,
      gst_percent: body.gst_percent ?? 18,
      sort_order,
    })
    .select('id, parent_id, name, slug, gst_percent, sort_order, is_active')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ category: data })
}
