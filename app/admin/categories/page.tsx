export const dynamic = 'force-dynamic'
import { CategoriesManager } from '@/components/admin/CategoriesManager'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'

export default function AdminCategoriesPage() {
  return (
    <div className="min-h-screen">
      <AdminPageHeader
        title="Categories"
        description="Manage product categories, subcategories, and category page content"
      />
      <div className="p-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <CategoriesManager />
        </div>
      </div>
    </div>
  )
}
