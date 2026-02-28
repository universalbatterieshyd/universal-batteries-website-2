import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { sendLeadToGoogleSheets } from '@/lib/google-sheets-leads'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, phone, email, queryType, message, website } = body

    if (website) {
      return NextResponse.json({ success: true }, { status: 200 })
    }

    if (!name || !phone || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { error } = await supabase.from('contact_submission').insert({
      name,
      phone,
      email: email || '',
      query_type: queryType || 'general',
      message,
    })

    if (error) {
      console.error('Contact form error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }

    await sendLeadToGoogleSheets({
      source: 'contact',
      name,
      phone,
      email: email || '',
      queryType: queryType || 'general',
      message,
    })

    return NextResponse.json(
      { success: true, message: 'Form submitted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
