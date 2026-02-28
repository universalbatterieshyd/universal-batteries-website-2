import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { ChevronRight, BookOpen, Zap, Sun } from 'lucide-react'

const resources = [
  {
    slug: 'home-backup-solar-hyderabad',
    title: "Homeowner's guide to backup and solar in Hyderabad",
    description: 'Understand inverter batteries, solar options, and how to choose the right solution for your home.',
    icon: BookOpen,
  },
  {
    slug: 'choose-right-ups-office',
    title: 'How to choose the right UPS for your office',
    description: 'Offline vs online UPS, load calculation, backup hours, and AMC considerations.',
    icon: Zap,
  },
  {
    slug: 'solar-basics-hyderabad',
    title: 'Solar basics: Off-grid vs on-grid',
    description: 'When to go off-grid, when on-grid makes sense, and net metering in Hyderabad.',
    icon: Sun,
  },
]

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20">
        <section className="relative py-20 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <div className="container relative mx-auto px-6 sm:px-6 lg:px-8">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Resources</h1>
            <p className="text-xl text-slate-300 max-w-2xl">
              Educational guides to help you choose the right power solution.
            </p>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-6 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {resources.map((r) => {
                const Icon = r.icon
                return (
                  <Link
                    key={r.slug}
                    href={`/resources/${r.slug}`}
                    className="group rounded-2xl border border-slate-200 dark:border-slate-700 bg-card p-8 hover:shadow-xl hover:border-primary/30 transition-all"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary mb-6 group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-7 w-7" />
                    </div>
                    <h2 className="text-xl font-semibold text-foreground mb-2">{r.title}</h2>
                    <p className="text-muted-foreground mb-4">{r.description}</p>
                    <span className="inline-flex items-center gap-1 text-primary font-medium">
                      Read guide <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
