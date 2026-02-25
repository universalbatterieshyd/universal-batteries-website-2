export const dynamic = 'force-dynamic';
import { supabase } from '@/lib/supabase'
import { BranchesManager } from '@/components/admin/BranchesManager'
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
    <div>
      <h1 className="text-2xl font-heading font-bold text-gray-900 mb-2">
        Branches
      </h1>
      <p className="text-gray-500 mb-8">
        Manage your branch locations
      </p>
      <BranchesManager initialBranches={branches} />
    </div>
  )
}
