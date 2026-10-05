import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { BackupCalculator } from '@/components/backup-calculator/BackupCalculator'

export const metadata: Metadata = {
  title: 'Power Backup Calculator | Universal Batteries',
  description:
    'Find the right inverter and battery for your home, shop, office or clinic in under a minute.',
}

export default function PowerBackupSizerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
      <Navbar />
      <main className="pt-20">
        <section className="px-4 pb-16 pt-6 sm:px-6 sm:pt-12">
          <div className="mx-auto max-w-xl">
            <nav className="mb-4 hidden items-center gap-1.5 text-xs text-slate-500 sm:flex">
              <Link href="/" className="hover:text-slate-900 dark:hover:text-white">Home</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <Link href="/solutions" className="hover:text-slate-900 dark:hover:text-white">Solutions</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-slate-900 dark:text-white">Backup Calculator</span>
            </nav>
            <div className="mb-5 text-center sm:mb-8">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E31B23]/10 px-3 py-1 text-xs font-semibold text-[#E31B23]">
                Free · 60 seconds
              </span>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
                How much backup do you need?
              </h1>
              <p className="mt-2 text-sm text-slate-500 sm:text-base">
                Get the right inverter and battery for your load, sized by experts.
              </p>
            </div>
          </div>
          <BackupCalculator />
        </section>
      </main>
      <Footer />
    </div>
  )
}
