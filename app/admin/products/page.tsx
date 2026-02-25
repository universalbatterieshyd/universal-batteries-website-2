export const dynamic = 'force-dynamic'
import { supabase } from '@/lib/supabase'
import { ProductsManager } from '@/components/admin/ProductsManager'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { toCamelCase, toCamelCaseArray } from '@/lib/db-utils'
import type { Product, ProductCategory } from '@/types/db'

export default async function ProductsPage() {
  const [productsRes, categoriesRes] = await Promise.all([
    supabase
      .from('product')
      .select('*, category:product_category(*)')
      .order('category_id', { ascending: true })
      .order('order', { ascending: true }),
    supabase.from('product_category').select('*').order('parent_id', { ascending: true }).order('order', { ascending: true }),
  ])

  const products = (productsRes.data || []).map((row) => {
    const transformed = toCamelCase(row) as Record<string, unknown>
    if (row.category) {
      transformed.category = toCamelCase(row.category)
    }
    return transformed as unknown as Product
  })
  const categories = toCamelCaseArray<ProductCategory>(categoriesRes.data || [])

  return (
    <div className="min-h-screen">
      <AdminPageHeader
        title="Products"
        description="Manage products and categories"
      />
      <div className="p-8">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <ProductsManager initialProducts={products} initialCategories={categories} />
        </div>
      </div>
    </div>
  )
}
