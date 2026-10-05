import { redirect } from 'next/navigation'
import { getQuoteProfile, isQuoteAdmin } from '@/lib/quotes/auth'
import { createClient } from '@/lib/supabase/server'
import { QuoteCategoryTree } from '@/components/quotes/QuoteCategoryTree'

export const dynamic = 'force-dynamic'

export type QuoteCategoryRow = {
  id: string
  parent_id: string | null
  name: string
  slug: string
  gst_percent: number
  sort_order: number
  is_active: boolean
}

export default async function QuoteCategoriesPage() {
  const profile = await getQuoteProfile()
  if (!profile) redirect('/quotes/login')
  if (!isQuoteAdmin(profile)) redirect('/quotes')

  const supabase = await createClient()
  const { data: categories } = await supabase
    .from('quote_categories')
    .select('id, parent_id, name, slug, gst_percent, sort_order, is_active')
    .order('sort_order', { ascending: true })

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-[#004C8F]">Quote Admin</p>
        <h1 className="text-2xl font-bold text-slate-900">Categories</h1>
        <p className="mt-1 max-w-2xl text-slate-600">
          Organize the product tree with drag-and-drop. On price-list upload, the Category column
          maps each SKU to a leaf. GST defaults to 18% per node.
        </p>
      </div>
      <QuoteCategoryTree initialCategories={(categories ?? []) as QuoteCategoryRow[]} />
    </div>
  )
}
