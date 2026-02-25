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
  if (body.quote !== undefined) updates.quote = body.quote
  if (body.role !== undefined) updates.role = body.role
  if (body.area !== undefined) updates.area = body.area
  if (body.customerName !== undefined) updates.customer_name = body.customerName
  if (body.rating !== undefined) updates.rating = body.rating
  if (body.isApproved !== undefined) updates.is_approved = body.isApproved
  if (body.imageUrl !== undefined) updates.image_url = body.imageUrl
  if (body.order !== undefined) updates.order = body.order
  updates.updated_at = new Date().toISOString()

  const { data: testimonial, error } = await supabase
    .from('testimonial')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Testimonial update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
  return NextResponse.json(toCamelCase(testimonial))
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
  const { error } = await supabase.from('testimonial').delete().eq('id', id)

  if (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
  return NextResponse.json({ success: true })
}
