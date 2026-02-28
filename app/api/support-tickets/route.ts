import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, phone, email, category, urgency, message, preferredSlot } = body

    if (!name || !phone || !category) {
      return NextResponse.json(
        { error: 'Missing required fields: name, phone, category' },
        { status: 400 }
      )
    }

    const validCategories = ['warranty', 'service', 'installation', 'product', 'billing', 'other']
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: 'Invalid category' },
        { status: 400 }
      )
    }

    const { error } = await supabase.from('support_ticket').insert({
      name,
      phone,
      email: email || null,
      category,
      urgency: urgency || 'normal',
      message: message || null,
      preferred_slot: preferredSlot || null,
    })

    if (error) {
      console.error('Support ticket error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, message: 'Ticket submitted. We\'ll get back soon.' },
      { status: 200 }
    )
  } catch (err) {
    console.error('Support ticket error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
