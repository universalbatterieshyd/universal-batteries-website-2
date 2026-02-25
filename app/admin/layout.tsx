import { getSupabaseSession } from '@/lib/auth'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSupabaseSession()

  return (
    <div className="min-h-screen bg-slate-50/80">
      {session ? (
        <div className="flex">
          <AdminSidebar />
          <main className="flex-1 pl-64 min-h-screen">
            {children}
          </main>
        </div>
      ) : (
        children
      )}
    </div>
  )
}
