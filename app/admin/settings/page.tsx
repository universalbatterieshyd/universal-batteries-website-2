export const dynamic = 'force-dynamic'
import { supabase } from '@/lib/supabase'
import { SettingsManager } from '@/components/admin/SettingsManager'
import { PasswordChangeForm } from '@/components/admin/PasswordChangeForm'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'

export default async function SettingsPage() {
  const { data } = await supabase.from('site_settings').select('key, value')
  const settings = Object.fromEntries((data || []).map((s) => [s.key, s.value]))

  return (
    <div className="min-h-screen">
      <AdminPageHeader
        title="Settings"
        description="Contact info, site configuration, and account security"
      />
      <div className="p-8 space-y-8">
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">Account</h2>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <PasswordChangeForm />
          </div>
        </section>
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">Site configuration</h2>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <SettingsManager initialSettings={settings} />
          </div>
        </section>
      </div>
    </div>
  )
}
