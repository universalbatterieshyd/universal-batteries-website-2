import Link from 'next/link'
import { redirect } from 'next/navigation'
import { FileText, FolderTree, LogOut, Plus, Settings, Upload } from 'lucide-react'
import { getQuoteProfile, isQuoteAdmin } from '@/lib/quotes/auth'
import { createClient } from '@/lib/supabase/server'

async function signOutAction() {
  'use server'
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/quotes/login')
}

export default async function QuotesLayout({ children }: { children: React.ReactNode }) {
  // Login page uses this layout too — skip chrome when no profile
  const profile = await getQuoteProfile()

  if (!profile) {
    return <>{children}</>
  }

  const admin = isQuoteAdmin(profile)

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4">
          <Link href="/quotes" className="flex items-center gap-2 font-semibold text-slate-900">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E31B23]/10">
              <FileText className="h-4 w-4 text-[#E31B23]" />
            </span>
            <span className="hidden sm:inline">Quotes</span>
          </Link>

          <nav className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/quotes/new"
              className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-[#E31B23] px-3 text-sm font-semibold text-white hover:bg-[#C8161D]"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New quote</span>
            </Link>
            {admin && (
              <>
                <Link
                  href="/quotes/admin/categories"
                  className="inline-flex h-10 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
                  title="Categories"
                >
                  <FolderTree className="h-4 w-4" />
                  <span className="hidden md:inline">Categories</span>
                </Link>
                <Link
                  href="/quotes/admin/import"
                  className="inline-flex h-10 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
                  title="Import"
                >
                  <Upload className="h-4 w-4" />
                  <span className="hidden md:inline">Import</span>
                </Link>
                <Link
                  href="/quotes/admin"
                  className="inline-flex h-10 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
                  title="Settings"
                >
                  <Settings className="h-4 w-4" />
                </Link>
              </>
            )}
            <form action={signOutAction}>
              <button
                type="submit"
                className="inline-flex h-10 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-slate-500 hover:bg-slate-100"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 pb-24">{children}</main>
    </div>
  )
}
