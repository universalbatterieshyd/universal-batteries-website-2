import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      companyName,
      contactPerson,
      email,
      phone,
      requiredQuantity,
      timeline,
      comments,
      website,
    } = body

    if (website) {
      return NextResponse.json({ success: true }, { status: 200 })
    }

    if (!companyName || !contactPerson || !email || !phone || !requiredQuantity || !timeline) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { error } = await supabase.from('enterprise_lead').insert({
      company_name: companyName,
      contact_person: contactPerson,
      email,
      phone,
      required_quantity: requiredQuantity,
      timeline,
      comments: comments || '',
    })

    if (error) {
      console.error('Enterprise form error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, message: 'Inquiry submitted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Enterprise form error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
