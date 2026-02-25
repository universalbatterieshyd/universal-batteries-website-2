import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSupabaseSession } from '@/lib/auth'
import { toCamelCase } from '@/lib/db-utils'

export async function GET() {
  const { data, error } = await supabase
    .from('product_category')
    .select('*')
    .order('order', { ascending: true })

  if (error) {
    console.error('Categories fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }

  const categories = (data || []).map((row) => toCamelCase(row))
  return NextResponse.json(categories)
}

export async function POST(request: NextRequest) {
  const session = await getSupabaseSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { name, slug, description, order } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    const categorySlug = slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

    const { data: category, error } = await supabase
      .from('product_category')
      .insert({
        name,
        slug: categorySlug,
        description: description || null,
        order: order ?? 0,
      })
      .select()
      .single()

    if (error) {
      console.error('Category create error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }

    return NextResponse.json(toCamelCase(category))
  } catch (error) {
    console.error('Category create error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
