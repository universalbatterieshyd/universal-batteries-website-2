export const dynamic = 'force-dynamic'
import { supabase } from '@/lib/supabase'
import { AboutUsManager } from '@/components/admin/AboutUsManager'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { toCamelCaseArray } from '@/lib/db-utils'

export default async function AboutUsPage() {
  const { data } = await supabase
    .from('about_us')
    .select('*')
    .order('order', { ascending: true })

  type Block = { id?: string; headline?: string; subheadline?: string; story?: string; imageUrl?: string; imageCaption?: string; order?: number }
  const blocks = toCamelCaseArray<Block>(data || [])

  return (
    <div className="min-h-screen">
      <AdminPageHeader
        title="About Us"
        description="Edit the About Us section: headline, story, and images. Add blocks to build your legacy story."
      />
      <div className="p-8">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <AboutUsManager initialBlocks={blocks} />
        </div>
      </div>
    </div>
  )
}
