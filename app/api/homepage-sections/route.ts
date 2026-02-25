import { NextResponse } from 'next/server'
import { getSupabaseSession } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export type HomepageSection = {
  id: string
  section_key: string
  order: number
  is_visible: boolean
  config: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

const SECTION_LABELS: Record<string, string> = {
  hero: 'Hero Banner',
  product_categories: 'Product Categories',
  why_choose_us: 'Why Choose Us',
  testimonials: 'Testimonials',
  contact_cta: 'Contact CTA',
  features_grid: 'Features Grid',
  image_text: 'Image + Text',
  faq: 'FAQ',
  cta_banner: 'CTA Banner',
}

const ADDABLE_TEMPLATES = ['features_grid', 'image_text', 'faq', 'cta_banner'] as const

const TEMPLATE_DEFAULTS: Record<string, Record<string, unknown>> = {
  features_grid: {
    title: 'Why Choose Us',
    subtitle: 'Your trusted partner',
    features: [
      { icon: 'Shield', title: 'Genuine Products', description: '100% authentic' },
      { icon: 'Truck', title: 'Fast Delivery', description: 'Same-day service' },
    ],
  },
  image_text: {
    heading: 'Quality & Service',
    body: 'We deliver genuine products with expert guidance.',
    imagePosition: 'right',
  },
  faq: {
    title: 'FAQ',
    subtitle: 'Common questions',
    items: [{ question: 'Question?', answer: 'Answer.' }],
  },
  cta_banner: {
    headline: 'Ready to Get Started?',
    subtext: 'Contact us today.',
    buttonText: 'Contact Us',
    buttonLink: '#contact',
  },
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('homepage_sections')
      .select('*')
      .order('order', { ascending: true })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: error.code === '42P01' ? 404 : 500 }
      )
    }
    const withLabels = (data || []).map((s) => ({
      ...s,
      label: SECTION_LABELS[s.section_key] || s.section_key,
    }))
    return NextResponse.json(withLabels)
  } catch (e: unknown) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to fetch' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const session = await getSupabaseSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = (await request.json()) as { section_key: string; config?: Record<string, unknown> }
    const { section_key, config } = body

    if (!section_key || !ADDABLE_TEMPLATES.includes(section_key as (typeof ADDABLE_TEMPLATES)[number])) {
      return NextResponse.json(
        { error: 'Invalid section_key. Use: features_grid, image_text, faq, cta_banner' },
        { status: 400 }
      )
    }

    const { data: maxOrder } = await supabase
      .from('homepage_sections')
      .select('order')
      .order('order', { ascending: false })
      .limit(1)
      .single()

    const nextOrder = (maxOrder?.order ?? -1) + 1
    const defaultConfig = TEMPLATE_DEFAULTS[section_key] ?? {}

    const { data, error } = await supabase
      .from('homepage_sections')
      .insert({
        section_key,
        order: nextOrder,
        is_visible: true,
        config: { ...defaultConfig, ...config },
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ...data, label: SECTION_LABELS[section_key] })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to add section' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  const session = await getSupabaseSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { sections } = body as {
      sections: { id: string; order: number; is_visible: boolean; config?: Record<string, unknown> }[]
    }

    if (!Array.isArray(sections)) {
      return NextResponse.json({ error: 'sections array required' }, { status: 400 })
    }

    for (const s of sections) {
      const updates: Record<string, unknown> = {
        order: s.order,
        is_visible: s.is_visible,
        updated_at: new Date().toISOString(),
      }
      if (s.config !== undefined) updates.config = s.config

      await supabase
        .from('homepage_sections')
        .update(updates)
        .eq('id', s.id)
    }

    const { data } = await supabase
      .from('homepage_sections')
      .select('*')
      .order('order', { ascending: true })

    return NextResponse.json(data)
  } catch (e: unknown) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to update' },
      { status: 500 }
    )
  }
}
