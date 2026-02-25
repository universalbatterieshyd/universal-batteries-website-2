import { getSupabaseSession } from '@/lib/auth'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSupabaseSession()

  return (
    <div className="min-h-screen bg-gray-100">
      {session ? (
        <div className="flex">
          <AdminSidebar />
          <main className="flex-1 p-8 ml-64 min-h-screen">
            {children}
          </main>
        </div>
      ) : (
        // Login page - no sidebar
        children
      )}
    </div>
  )
}
