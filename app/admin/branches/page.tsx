export const dynamic = 'force-dynamic'
import { supabase } from '@/lib/supabase'
import { BranchesManager } from '@/components/admin/BranchesManager'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { toCamelCaseArray } from '@/lib/db-utils'
import type { Branch } from '@/types/db'

export default async function BranchesPage() {
  const { data } = await supabase
    .from('branch')
    .select('*')
    .order('is_main', { ascending: false })
    .order('order', { ascending: true })
    .order('name', { ascending: true })

  const branches = toCamelCaseArray<Branch>(data || [])

  return (
    <div className="min-h-screen">
      <AdminPageHeader
        title="Branches"
        description="Manage branch locations and contact details"
      />
      <div className="p-8">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <BranchesManager initialBranches={branches} />
        </div>
      </div>
    </div>
  )
}
