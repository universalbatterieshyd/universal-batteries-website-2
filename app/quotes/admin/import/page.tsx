import { redirect } from 'next/navigation'
import { getQuoteProfile, isQuoteAdmin } from '@/lib/quotes/auth'
import { QuoteImportForm } from '@/components/quotes/QuoteImportForm'

export const dynamic = 'force-dynamic'

export default async function QuoteImportPage() {
  const profile = await getQuoteProfile()
  if (!profile) redirect('/quotes/login')
  if (!isQuoteAdmin(profile)) redirect('/quotes')

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-[#004C8F]">Quote Admin</p>
        <h1 className="text-2xl font-bold text-slate-900">Import price list</h1>
        <p className="mt-1 text-slate-600">
          Upload <code className="text-sm">Universal_Price List.xlsx</code>. Helper sheets are
          skipped. Prefer adding categories in Quotes Admin first, then a matching Category column
          on each product row.
        </p>
      </div>
      <QuoteImportForm />
    </div>
  )
}
