import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSupabaseSession } from '@/lib/auth'
import { toCamelCase } from '@/lib/db-utils'

export async function GET() {
  const { data, error } = await supabase
    .from('testimonial')
    .select('*')
    .eq('is_approved', true)
    .order('order', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Testimonials fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }

  const testimonials = (data || []).map((row) => toCamelCase(row))
  return NextResponse.json(testimonials)
}

export async function POST(request: NextRequest) {
  const session = await getSupabaseSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { quote, role, area, customerName, rating, isApproved, imageUrl, order } = body

    if (!quote || !role) {
      return NextResponse.json(
        { error: 'Quote and role are required' },
        { status: 400 }
      )
    }

    const { data: testimonial, error } = await supabase
      .from('testimonial')
      .insert({
        quote,
        role,
        area: area || null,
        customer_name: customerName || null,
        rating: rating ?? 5,
        is_approved: isApproved ?? true,
        image_url: imageUrl || null,
        order: order ?? 0,
      })
      .select()
      .single()

    if (error) {
      console.error('Testimonial create error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }

    return NextResponse.json(toCamelCase(testimonial))
  } catch (error) {
    console.error('Testimonial create error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
