import { redirect } from 'next/navigation'
import { getQuoteProfile } from '@/lib/quotes/auth'

export const dynamic = 'force-dynamic'

export default async function NewQuotePage() {
  const profile = await getQuoteProfile()
  if (!profile) redirect('/quotes/login')

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">New quote</h1>
      <p className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center text-slate-600">
        Quote builder coming next — customer search, SKU autocomplete, Target/Floor prices, buyback,
        and PDF.
      </p>
    </div>
  )
}
