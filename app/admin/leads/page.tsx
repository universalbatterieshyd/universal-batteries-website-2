export const dynamic = 'force-dynamic'
import { supabase } from '@/lib/supabase'
import { LeadsManager } from '@/components/admin/LeadsManager'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'

export type Lead = {
  id: string
  phone: string
  area: string | null
  type: string
  source: string
  payload: Record<string, unknown>
  status: string
  notes: string | null
  score: number
  createdAt: string
}

export default async function LeadsPage() {
  const { data: leads } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })

  const formatted = (leads || []).map((l) => ({
    id: l.id,
    phone: l.phone,
    area: l.area,
    type: l.type,
    source: l.source,
    payload: (l.payload as Record<string, unknown>) || {},
    status: l.status || 'new',
    notes: l.notes,
    score: l.score ?? 0,
    createdAt: l.created_at,
  }))

  return (
    <div className="min-h-screen">
      <AdminPageHeader
        title="Leads"
        description="Battery finder, UPS proposal, solar enquiry, and other form submissions"
      />
      <div className="p-8">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <LeadsManager initialLeads={formatted} />
        </div>
      </div>
    </div>
  )
}
