export const dynamic = 'force-dynamic'
import { supabase } from '@/lib/supabase'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { TicketsManager } from '@/components/admin/TicketsManager'

export type Ticket = {
  id: string
  name: string
  phone: string
  email: string | null
  category: string
  urgency: string
  message: string | null
  preferredSlot: string | null
  status: string
  notes: string | null
  createdAt: string
}

export default async function TicketsPage() {
  const { data: rows } = await supabase
    .from('support_ticket')
    .select('*')
    .order('created_at', { ascending: false })

  const tickets: Ticket[] = (rows || []).map((r) => ({
    id: r.id,
    name: r.name,
    phone: r.phone,
    email: r.email,
    category: r.category,
    urgency: r.urgency || 'normal',
    message: r.message,
    preferredSlot: r.preferred_slot,
    status: r.status || 'open',
    notes: r.notes,
    createdAt: r.created_at,
  }))

  return (
    <div className="min-h-screen">
      <AdminPageHeader
        title="Support Tickets"
        description="Warranty, service, installation, and product enquiries"
      />
      <div className="p-8">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <TicketsManager initialTickets={tickets} />
        </div>
      </div>
    </div>
  )
}
