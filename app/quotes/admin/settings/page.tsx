import { redirect } from 'next/navigation'
import { getQuoteProfile, isQuoteAdmin } from '@/lib/quotes/auth'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function QuoteSettingsPage() {
  const profile = await getQuoteProfile()
  if (!profile) redirect('/quotes/login')
  if (!isQuoteAdmin(profile)) redirect('/quotes')

  const supabase = await createClient()
  const { data: settings } = await supabase.from('quote_pricing_settings').select('*').eq('id', 1).maybeSingle()

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Pricing defaults</h1>
      <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-700 shadow-sm">
        <p>
          Floor markup: <strong>{settings?.floor_markup_percent ?? 11}%</strong> on DP
        </p>
        <p className="mt-2">
          Target: <strong>{settings?.target_mode ?? 'percent_of_floor'}</strong>{' '}
          {settings?.target_mode === 'fixed_amount'
            ? `₹${settings?.target_fixed_amount ?? 0}`
            : `+${settings?.target_percent ?? 3}% on Floor`}
        </p>
        <p className="mt-2">
          Rounding: <strong>{settings?.rounding_mode ?? 'ceil_100'}</strong>
        </p>
        <p className="mt-4 text-slate-500">Editable form coming next — values are seeded in the DB.</p>
      </div>
    </div>
  )
}
