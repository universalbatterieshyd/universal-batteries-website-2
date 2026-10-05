import { redirect } from 'next/navigation'
import { getQuoteProfile, isQuoteAdmin } from '@/lib/quotes/auth'

export const dynamic = 'force-dynamic'

export default async function QuoteUsersPage() {
  const profile = await getQuoteProfile()
  if (!profile) redirect('/quotes/login')
  if (!isQuoteAdmin(profile)) redirect('/quotes')

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Users & access</h1>
      <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-700 shadow-sm space-y-3">
        <p>
          Create the user in <strong>Supabase Auth</strong>, then insert a row into{' '}
          <code className="text-xs">quote_profiles</code>:
        </p>
        <pre className="overflow-x-auto rounded-lg bg-slate-900 p-4 text-xs text-slate-100">{`INSERT INTO quote_profiles (user_id, role, display_name, branch_id, can_access_cms)
VALUES (
  '<auth-user-uuid>',
  'quote_admin',  -- or salesperson | shop_boy
  'Saurabh',
  (SELECT id FROM quote_branches WHERE code = 'MG'),
  true            -- false for shop staff (blocks /admin)
);`}</pre>
        <p className="text-slate-500">
          Shop staff: <code className="text-xs">can_access_cms = false</code>. They only use{' '}
          <code className="text-xs">/quotes/login</code>.
        </p>
      </div>
    </div>
  )
}
