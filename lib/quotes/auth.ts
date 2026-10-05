import { createClient } from '@/lib/supabase/server'

export type QuoteRole = 'quote_admin' | 'salesperson' | 'shop_boy'

export type QuoteProfile = {
  user_id: string
  role: QuoteRole
  display_name: string | null
  branch_id: string | null
  can_access_cms: boolean
  is_active: boolean
}

export async function getQuoteProfile(): Promise<QuoteProfile | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('quote_profiles')
    .select('user_id, role, display_name, branch_id, can_access_cms, is_active')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .maybeSingle()

  if (error || !data) return null
  return data as QuoteProfile
}

export async function requireQuoteProfile(): Promise<QuoteProfile | null> {
  return getQuoteProfile()
}

export function isQuoteAdmin(profile: QuoteProfile | null): boolean {
  return profile?.role === 'quote_admin'
}
