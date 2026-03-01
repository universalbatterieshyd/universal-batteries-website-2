import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSupabaseSession } from '@/lib/auth'

const ALLOWED_TYPES = ['logo', 'favicon', 'banner', 'hero', 'chip', 'category']
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

export async function POST(request: NextRequest) {
  const session = await getSupabaseSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const contentType = request.headers.get('content-type') || ''
  if (!contentType.includes('multipart/form-data')) {
    return NextResponse.json({ error: 'Expected multipart/form-data' }, { status: 400 })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const type = (formData.get('type') as string) || 'logo'

  if (!file || file.size === 0) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  if (!ALLOWED_TYPES.includes(type)) {
    return NextResponse.json({ error: `Invalid type. Use: ${ALLOWED_TYPES.join(', ')}` }, { status: 400 })
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 })
  }

  const ext = file.name.split('.').pop() || 'png'
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
  const path = `${type}s/${Date.now()}-${safeName}`

  const buffer = Buffer.from(await file.arrayBuffer())

  const { data, error } = await supabase.storage
    .from('uploads')
    .upload(path, buffer, {
      contentType: file.type,
      upsert: true,
    })

  if (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: error.message || 'Upload failed. Ensure the "uploads" bucket exists in Supabase Storage.' },
      { status: 500 }
    )
  }

  const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(data.path)
  return NextResponse.json({ url: urlData.publicUrl })
}
