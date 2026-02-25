import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSupabaseSession } from '@/lib/auth'
import { toCamelCase } from '@/lib/db-utils'

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

  const updates: Record<string, unknown> = {}
  if (body.title !== undefined) updates.title = body.title
  if (body.slug !== undefined) updates.slug = body.slug
  if (body.description !== undefined) updates.description = body.description
  if (body.categoryId !== undefined) updates.category_id = body.categoryId
  if (body.specifications !== undefined) updates.specifications = body.specifications ? JSON.stringify(body.specifications) : null
  if (body.brands !== undefined) updates.brands = body.brands ? JSON.stringify(body.brands) : null
  if (body.imageUrl !== undefined) updates.image_url = body.imageUrl
  if (body.isActive !== undefined) updates.is_active = body.isActive
  if (body.order !== undefined) updates.order = body.order
  updates.updated_at = new Date().toISOString()

  const { data: product, error } = await supabase
    .from('product')
    .update(updates)
    .eq('id', id)
    .select('*, category:product_category(*)')
    .single()

  if (error) {
    console.error('Product update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }

  const transformed = toCamelCase(product)
  if (product.category) {
    ;(transformed as Record<string, unknown>).category = toCamelCase(product.category)
  }
  return NextResponse.json(transformed)
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
  const { error } = await supabase.from('product').delete().eq('id', id)

  if (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
  return NextResponse.json({ success: true })
}
