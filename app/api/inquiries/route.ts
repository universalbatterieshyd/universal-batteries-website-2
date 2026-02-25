import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSupabaseSession } from '@/lib/auth'
import { toCamelCase } from '@/lib/db-utils'

export async function GET() {
  const session = await getSupabaseSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [contactsRes, enterpriseRes] = await Promise.all([
    supabase.from('contact_submission').select('*').order('created_at', { ascending: false }),
    supabase.from('enterprise_lead').select('*').order('created_at', { ascending: false }),
  ])

  const contacts = (contactsRes.data || []).map((row) => toCamelCase(row))
  const enterprise = (enterpriseRes.data || []).map((row) => toCamelCase(row))

  return NextResponse.json({ contacts, enterprise })
}
