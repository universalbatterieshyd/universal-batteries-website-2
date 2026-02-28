import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

type SolutionPageLayoutProps = {
  title: string
  tagline: string
  icon: React.ReactNode
  children: React.ReactNode
  ctaSection?: React.ReactNode
}

export function SolutionPageLayout({ title, tagline, icon, children, ctaSection }: SolutionPageLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20">
        {/* Hero */}
        <section className="relative py-20 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <div className="container relative mx-auto px-6 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <ChevronRight className="h-4 w-4" />
              <Link href="/solutions" className="hover:text-white transition-colors">Solutions</Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-white">{title}</span>
            </div>
            <div className="flex items-start gap-6">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/20 text-primary">
                {icon}
              </div>
              <div>
                <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3">{title}</h1>
                <p className="text-xl text-slate-300 max-w-2xl">{tagline}</p>
              </div>
            </div>
          </div>
        </section>

        {children}

        {ctaSection && (
          <section className="py-20 bg-slate-50 dark:bg-slate-900/50">
            <div className="container mx-auto px-6 sm:px-6 lg:px-8">
              {ctaSection}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  )
}
