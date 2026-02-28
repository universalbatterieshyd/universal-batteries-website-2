export const dynamic = 'force-dynamic'
import { supabase } from '@/lib/supabase'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AppliancesManager } from '@/components/admin/AppliancesManager'

export type Appliance = {
  id: string
  key: string
  name: string
  watts: number
  emoji: string
  showInVisual: boolean
  order: number
}

export default async function AppliancesPage() {
  const { data } = await supabase
    .from('appliance')
    .select('*')
    .order('order', { ascending: true })

  const appliances: Appliance[] = (data || []).map((r) => ({
    id: r.id,
    key: r.key,
    name: r.name,
    watts: r.watts,
    emoji: r.emoji || '📦',
    showInVisual: r.show_in_visual !== false,
    order: r.order ?? 0,
  }))

  return (
    <div className="min-h-screen">
      <AdminPageHeader
        title="Appliances"
        description="Manage appliances for the power backup load calculator."
      />
      <div className="p-8">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <AppliancesManager initialAppliances={appliances} />
        </div>
      </div>
    </div>
  )
}
