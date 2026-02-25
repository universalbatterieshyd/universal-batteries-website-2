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
  if (body.contacted !== undefined) updates.contacted = body.contacted
  if (body.notes !== undefined) updates.notes = body.notes

  const { data, error } = await supabase
    .from('enterprise_lead')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }

  return NextResponse.json(toCamelCase(data))
}
