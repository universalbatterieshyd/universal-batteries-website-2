import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSupabaseSession } from '@/lib/auth'
import { toCamelCase } from '@/lib/db-utils'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { data: branch, error } = await supabase
    .from('branch')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !branch) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json(toCamelCase(branch))
}

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
  if (body.name !== undefined) updates.name = body.name
  if (body.address !== undefined) updates.address = body.address
  if (body.phone !== undefined) updates.phone = body.phone
  if (body.email !== undefined) updates.email = body.email
  if (body.hours !== undefined) updates.hours = body.hours
  if (body.manager !== undefined) updates.manager = body.manager
  if (body.mapsUrl !== undefined) updates.maps_url = body.mapsUrl
  if (body.isMain !== undefined) updates.is_main = body.isMain
  if (body.order !== undefined) updates.order = body.order
  updates.updated_at = new Date().toISOString()

  const { data: branch, error } = await supabase
    .from('branch')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Branch update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
  return NextResponse.json(toCamelCase(branch))
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
  const { error } = await supabase.from('branch').delete().eq('id', id)

  if (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
  return NextResponse.json({ success: true })
}
