import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSupabaseSession } from '@/lib/auth'
import { toCamelCase } from '@/lib/db-utils'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')

  let query = supabase
    .from('product')
    .select('*, category:product_category(*)')
    .eq('is_active', true)

  if (category) {
    const { data: cat } = await supabase
      .from('product_category')
      .select('id')
      .eq('slug', category)
      .single()
    if (cat) query = query.eq('category_id', cat.id)
  }

  const { data, error } = await query
    .order('order', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Products fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }

  const products = (data || []).map((row) => {
    const transformed = toCamelCase(row)
    if (row.category) {
      ;(transformed as Record<string, unknown>).category = toCamelCase(row.category)
    }
    return transformed
  })
  return NextResponse.json(products)
}

export async function POST(request: NextRequest) {
  const session = await getSupabaseSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { title, slug, description, categoryId, specifications, brands, imageUrl, isActive, order } = body

    if (!title || !categoryId) {
      return NextResponse.json(
        { error: 'Title and category are required' },
        { status: 400 }
      )
    }

    const productSlug = slug || title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

    const { data: product, error } = await supabase
      .from('product')
      .insert({
        title,
        slug: productSlug,
        description: description || null,
        category_id: categoryId,
        specifications: specifications ? JSON.stringify(specifications) : null,
        brands: brands ? JSON.stringify(brands) : null,
        image_url: imageUrl || null,
        is_active: isActive ?? true,
        order: order ?? 0,
      })
      .select('*, category:product_category(*)')
      .single()

    if (error) {
      console.error('Product create error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }

    const transformed = toCamelCase(product)
    if (product.category) {
      ;(transformed as Record<string, unknown>).category = toCamelCase(product.category)
    }
    return NextResponse.json(transformed)
  } catch (error) {
    console.error('Product create error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
