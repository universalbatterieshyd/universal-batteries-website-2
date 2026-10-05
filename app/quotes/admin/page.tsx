import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getQuoteProfile, isQuoteAdmin } from '@/lib/quotes/auth'

export const dynamic = 'force-dynamic'

export default async function QuotesAdminHomePage() {
  const profile = await getQuoteProfile()
  if (!profile) redirect('/quotes/login')
  if (!isQuoteAdmin(profile)) redirect('/quotes')

  const cards = [
    {
      href: '/quotes/admin/categories',
      title: 'Category hierarchy',
      body: 'Drag-and-drop tree, GST %, shop-boy access later.',
    },
    {
      href: '/quotes/admin/import',
      title: 'Import price list',
      body: 'Upload Universal_Price List.xlsx — Category column maps to leaves.',
    },
    {
      href: '/quotes/admin/settings',
      title: 'Pricing defaults',
      body: 'Floor %, Target % or fixed ₹, rounding rules.',
    },
    {
      href: '/quotes/admin/users',
      title: 'Users & branches',
      body: 'Grant Quotes access. Shop staff never get CMS access.',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-[#004C8F]">Quote Admin</p>
        <h1 className="text-2xl font-bold text-slate-900">Setup & control</h1>
        <p className="mt-1 text-slate-600">
          Separate from website Admin. Only quote admins see this area.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-[#004C8F]/40 hover:shadow-md"
          >
            <h2 className="font-semibold text-slate-900">{c.title}</h2>
            <p className="mt-2 text-sm text-slate-500">{c.body}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
