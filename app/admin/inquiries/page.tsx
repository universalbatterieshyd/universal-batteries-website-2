export const dynamic = 'force-dynamic'
import { supabase } from '@/lib/supabase'
import { InquiriesManager } from '@/components/admin/InquiriesManager'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { toCamelCaseArray } from '@/lib/db-utils'
import type { Contact, Enterprise } from '@/types/db'

export default async function InquiriesPage() {
  const [contactsRes, enterpriseRes] = await Promise.all([
    supabase.from('contact_submission').select('*').order('created_at', { ascending: false }),
    supabase.from('enterprise_lead').select('*').order('created_at', { ascending: false }),
  ])

  const contacts = toCamelCaseArray<Contact>(contactsRes.data || [])
  const enterprise = toCamelCaseArray<Enterprise>(enterpriseRes.data || [])

  return (
    <div className="min-h-screen">
      <AdminPageHeader
        title="Inquiries"
        description="Contact form submissions and enterprise leads"
      />
      <div className="p-8">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <InquiriesManager initialContacts={contacts} initialEnterprise={enterprise} />
        </div>
      </div>
    </div>
  )
}
