import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getQuoteProfile, isQuoteAdmin } from '@/lib/quotes/auth'

export async function POST(request: Request) {
  const profile = await getQuoteProfile()
  if (!isQuoteAdmin(profile)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const items = body.items as { id: string; parent_id: string | null; sort_order: number }[]
  if (!Array.isArray(items)) {
    return NextResponse.json({ error: 'Invalid items' }, { status: 400 })
  }

  const supabase = await createClient()
  for (const item of items) {
    const { error } = await supabase
      .from('quote_categories')
      .update({ parent_id: item.parent_id, sort_order: item.sort_order })
      .eq('id', item.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}
