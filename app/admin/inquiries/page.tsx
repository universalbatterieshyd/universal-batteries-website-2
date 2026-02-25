export const dynamic = 'force-dynamic';
import { supabase } from '@/lib/supabase'
import { InquiriesManager } from '@/components/admin/InquiriesManager'
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
    <div>
      <h1 className="text-2xl font-heading font-bold text-gray-900 mb-2">
        Inquiries
      </h1>
      <p className="text-gray-500 mb-8">
        Contact form submissions and enterprise leads
      </p>
      <InquiriesManager initialContacts={contacts} initialEnterprise={enterprise} />
    </div>
  )
}
