import { getSupabaseSession } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { HeroContentManager } from '@/components/admin/HeroContentManager'
import { PageBuilderManager } from '@/components/admin/PageBuilderManager'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'

export default async function HomepageAdminPage() {
  const session = await getSupabaseSession()
  if (!session) return null

  let hero = null
  try {
    const { data } = await supabase
      .from('hero_content')
      .select('*')
      .order('order', { ascending: true })
      .limit(1)
      .maybeSingle()
    hero = data
  } catch {
    // Table may not exist yet
  }

  return (
    <div className="min-h-screen">
      <AdminPageHeader
        title="Homepage"
        description="Edit the hero banner and drag sections to reorder the homepage"
      />
      <div className="p-8">
        <section className="mb-12">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">Hero banner</h2>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <HeroContentManager initialData={hero} />
          </div>
        </section>
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">Page sections</h2>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <PageBuilderManager />
          </div>
        </section>
      </div>
    </div>
  )
}
