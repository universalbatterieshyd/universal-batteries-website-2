export const dynamic = 'force-dynamic';
import { supabase } from '@/lib/supabase'
import { SettingsManager } from '@/components/admin/SettingsManager'

export default async function SettingsPage() {
  const { data } = await supabase.from('site_settings').select('key, value')
  const settings = Object.fromEntries((data || []).map((s) => [s.key, s.value]))

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold text-gray-900 mb-2">
        Settings
      </h1>
      <p className="text-gray-500 mb-8">
        Contact info and site configuration
      </p>
      <SettingsManager initialSettings={settings} />
    </div>
  )
}
