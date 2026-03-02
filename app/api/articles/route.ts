import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSupabaseSession } from '@/lib/auth'
import { toCamelCase } from '@/lib/db-utils'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const all = searchParams.get('all') === 'true'

  let query = supabase.from('article').select('*').order('created_at', { ascending: false })
  if (!all) query = query.eq('is_published', true)

  const { data, error } = await query

  if (error) {
    console.error('Articles fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
  return NextResponse.json((data || []).map((r) => toCamelCase(r)))
}

export async function POST(request: NextRequest) {
  const session = await getSupabaseSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const { title, slug, excerpt, content, featuredImageUrl, isPublished } = body

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const articleSlug = slug?.trim() || title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

    const { data, error } = await supabase
      .from('article')
      .insert({
        title: title.trim(),
        slug: articleSlug,
        excerpt: excerpt?.trim() || null,
        content: content?.trim() || '',
        featured_image_url: featuredImageUrl?.trim() || null,
        is_published: isPublished ?? true,
      })
      .select()
      .single()

    if (error) {
      console.error('Article create error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json(toCamelCase(data))
  } catch (e) {
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 })
  }
}
