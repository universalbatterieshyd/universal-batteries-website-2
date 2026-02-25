import { getSupabaseSession } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { HeroContentManager } from '@/components/admin/HeroContentManager'

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
    <div>
      <h1 className="text-2xl font-heading font-bold text-gray-900 mb-2">
        Homepage Content
      </h1>
      <p className="text-gray-500 mb-8">
        Edit the hero banner headline, subheadline, and call-to-action buttons
      </p>
      <HeroContentManager initialData={hero} />
    </div>
  )
}
