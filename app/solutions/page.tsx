import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { Home, Building2, Factory, Sun, Zap, ChevronRight } from 'lucide-react'

const solutions = [
  {
    slug: 'home-backup',
    title: 'Home Backup',
    tagline: 'Inverter + battery solutions for homes',
    icon: Home,
    href: '/solutions/home-backup',
  },
  {
    slug: 'power-backup-sizer',
    title: 'Power Backup Calculator',
    tagline: 'Calculate inverter & battery requirements',
    icon: Zap,
    href: '/solutions/power-backup-sizer',
  },
  {
    slug: 'office-ups',
    title: 'Office & UPS',
    tagline: 'UPS, AMC for offices, clinics, datacentres',
    icon: Building2,
    href: '/solutions/office-ups',
  },
  {
    slug: 'factory-power',
    title: 'Factory & Industrial',
    tagline: 'Industrial and institutional power solutions',
    icon: Factory,
    href: '/solutions/factory-power',
  },
  {
    slug: 'home-solar',
    title: 'Home Solar',
    tagline: 'Off-grid solar for homes',
    icon: Sun,
    href: '/solutions/home-solar',
  },
  {
    slug: 'business-solar',
    title: 'Business Solar',
    tagline: 'On-grid solar for businesses',
    icon: Zap,
    href: '/solutions/business-solar',
  },
]

export default function SolutionsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20">
        <section className="relative py-20 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <div className="container relative mx-auto px-6 sm:px-6 lg:px-8">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Solutions</h1>
            <p className="text-xl text-slate-300 max-w-2xl">
              Power solutions tailored to your needs — from home backup to industrial UPS and solar.
            </p>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-6 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {solutions.map((s) => {
                const Icon = s.icon
                return (
                  <Link
                    key={s.slug}
                    href={s.href}
                    className="group rounded-2xl border border-slate-200 dark:border-slate-700 bg-card p-8 hover:shadow-xl hover:border-primary/30 transition-all"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary mb-6 group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-7 w-7" />
                    </div>
                    <h2 className="text-xl font-semibold text-foreground mb-2">{s.title}</h2>
                    <p className="text-muted-foreground mb-4">{s.tagline}</p>
                    <span className="inline-flex items-center gap-1 text-primary font-medium">
                      Learn more <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
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
