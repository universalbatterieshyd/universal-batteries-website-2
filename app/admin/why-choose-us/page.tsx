export const dynamic = 'force-dynamic'
import { supabase } from '@/lib/supabase'
import { WhyChooseUsManager } from '@/components/admin/WhyChooseUsManager'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { toCamelCaseArray } from '@/lib/db-utils'

export default async function WhyChooseUsPage() {
  const { data } = await supabase
    .from('why_choose_us')
    .select('*')
    .order('order', { ascending: true })

  type Item = { id?: string; title: string; description: string; icon: string; order?: number }
  const items = toCamelCaseArray<Item>(data || [])

  return (
    <div className="min-h-screen">
      <AdminPageHeader
        title="Why Choose Us"
        description="Edit USPs shown in the Why Choose Universal Batteries section. Use 4 or 6 items for symmetric layout."
      />
      <div className="p-8">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <WhyChooseUsManager initialItems={items} />
        </div>
      </div>
    </div>
  )
}
