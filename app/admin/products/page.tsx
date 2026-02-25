export const dynamic = 'force-dynamic';
import { supabase } from '@/lib/supabase'
import { ProductsManager } from '@/components/admin/ProductsManager'
import { toCamelCase, toCamelCaseArray } from '@/lib/db-utils'
import type { Product, ProductCategory } from '@/types/db'

export default async function ProductsPage() {
  const [productsRes, categoriesRes] = await Promise.all([
    supabase
      .from('product')
      .select('*, category:product_category(*)')
      .order('category_id', { ascending: true })
      .order('order', { ascending: true }),
    supabase.from('product_category').select('*').order('order', { ascending: true }),
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
    <div>
      <h1 className="text-2xl font-heading font-bold text-gray-900 mb-2">
        Products
      </h1>
      <p className="text-gray-500 mb-8">
        Manage products and categories
      </p>
      <ProductsManager initialProducts={products} initialCategories={categories} />
    </div>
  )
}
