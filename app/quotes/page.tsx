import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Plus, FileText } from 'lucide-react'
import { getQuoteProfile, isQuoteAdmin } from '@/lib/quotes/auth'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function QuotesHomePage() {
  const profile = await getQuoteProfile()
  if (!profile) redirect('/quotes/login')

  const supabase = await createClient()
  const { data: quotes } = await supabase
    .from('quote_quotes')
    .select('id, quote_number, customer_name, total, status, created_at, source')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(30)

  const admin = isQuoteAdmin(profile)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {profile.display_name || 'Shop user'} · {profile.role.replace('_', ' ')}
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Rapid Quotes
          </h1>
          <p className="mt-1 text-slate-600">Create a quote in under 30 seconds.</p>
        </div>
        <Link
          href="/quotes/new"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#E31B23] px-5 text-base font-semibold text-white shadow-sm hover:bg-[#C8161D]"
        >
          <Plus className="h-5 w-5" />
          New quote
        </Link>
      </div>

      {admin && (
        <div className="grid gap-3 sm:grid-cols-3">
          <Link
            href="/quotes/admin/categories"
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-[#004C8F]/30"
          >
            <p className="font-semibold text-slate-900">Categories</p>
            <p className="mt-1 text-sm text-slate-500">Drag-and-drop hierarchy & GST</p>
          </Link>
          <Link
            href="/quotes/admin/import"
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-[#004C8F]/30"
          >
            <p className="font-semibold text-slate-900">Import price list</p>
            <p className="mt-1 text-sm text-slate-500">Upload dealer Excel workbook</p>
          </Link>
          <Link
            href="/quotes/admin"
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-[#004C8F]/30"
          >
            <p className="font-semibold text-slate-900">Quote admin</p>
            <p className="mt-1 text-sm text-slate-500">Users, markups, branches</p>
          </Link>
        </div>
      )}

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-4 py-3">
          <h2 className="font-semibold text-slate-900">Recent quotes</h2>
        </div>
        {!quotes?.length ? (
          <div className="flex flex-col items-center gap-3 px-4 py-14 text-center">
            <FileText className="h-10 w-10 text-slate-300" />
            <p className="text-slate-600">No quotes yet.</p>
            <Link href="/quotes/new" className="text-sm font-semibold text-[#E31B23] hover:underline">
              Create your first quote
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {quotes.map((q) => (
              <li key={q.id}>
                <Link
                  href={`/quotes/${q.id}`}
                  className="flex items-center justify-between gap-3 px-4 py-3.5 hover:bg-slate-50"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900 truncate">
                      {q.quote_number}
                      {q.customer_name ? ` · ${q.customer_name}` : ''}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(q.created_at).toLocaleString('en-IN')} · {q.status}
                    </p>
                  </div>
                  <p className="shrink-0 font-semibold text-slate-900">
                    ₹{Number(q.total).toLocaleString('en-IN')}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
