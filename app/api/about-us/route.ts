import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSupabaseSession } from '@/lib/auth'
import { toCamelCaseArray } from '@/lib/db-utils'

export async function GET() {
  const { data, error } = await supabase
    .from('about_us')
    .select('*')
    .order('order', { ascending: true })

  if (error) {
    console.error('About us fetch error:', error)
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
    const blocks = body.blocks as {
      id?: string
      headline?: string
      subheadline?: string
      story?: string
      imageUrl?: string
      imageCaption?: string
      order: number
    }[]

    if (!Array.isArray(blocks)) {
      return NextResponse.json({ error: 'Blocks array required' }, { status: 400 })
    }

    await supabase.from('about_us').delete().neq('id', '')
    for (let i = 0; i < blocks.length; i++) {
      const b = blocks[i]
      await supabase.from('about_us').insert({
        headline: b.headline || null,
        subheadline: b.subheadline || null,
        story: b.story || null,
        image_url: b.imageUrl || null,
        image_caption: b.imageCaption || null,
        order: i,
      })
    }

    const { data } = await supabase
      .from('about_us')
      .select('*')
      .order('order', { ascending: true })

    return NextResponse.json(toCamelCaseArray(data || []))
  } catch (err) {
    console.error('About us update error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
