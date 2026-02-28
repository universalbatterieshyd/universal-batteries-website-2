import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status, assignedTo, notes } = body

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (status !== undefined) updates.status = status
    if (assignedTo !== undefined) updates.assigned_to = assignedTo
    if (notes !== undefined) updates.notes = notes

    const { data, error } = await supabase
      .from('support_ticket')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Support ticket update error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      id: data.id,
      status: data.status,
      assigned_to: data.assigned_to,
      notes: data.notes,
      updated_at: data.updated_at,
    })
  } catch (err) {
    console.error('Support ticket update error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
