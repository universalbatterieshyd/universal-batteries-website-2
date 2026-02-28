import { SolutionPageLayout } from '@/components/solutions/SolutionPageLayout'
import { BatteryFinderForm } from '@/components/leads/BatteryFinderForm'
import { Home } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function HomeBackupPage() {
  return (
    <SolutionPageLayout
      title="Home Backup"
      tagline="Inverter + battery solutions for homes. Reliable backup power for lights, fans, and essentials during power cuts."
      icon={<Home className="h-8 w-8" />}
      ctaSection={
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Need home backup or solar?</h2>
          <p className="text-muted-foreground mb-6">
            Get a personalised recommendation based on your load and backup hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/solutions/home-backup#battery-finder">Find Your Battery</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/solutions/office-ups">UPS for Office</Link>
            </Button>
          </div>
        </div>
      }
    >
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto prose prose-slate dark:prose-invert">
            <h2>Why choose home backup?</h2>
            <p>
              Power cuts are common in Hyderabad. A quality inverter and battery keep your lights, fans,
              and essential appliances running. We offer genuine brands with warranty and same-day service.
            </p>
            <h3>What we offer</h3>
            <ul>
              <li>Inverter batteries (tall tubular, SMF)</li>
              <li>Inverters (600 VA to 5 kVA)</li>
              <li>Installation and trolley options</li>
              <li>Exchange and warranty support</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="battery-finder" className="py-20 gradient-subtle">
        <div className="container mx-auto px-6 sm:px-6 lg:px-8">
          <div className="max-w-xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground mb-2">Looking for a battery replacement?</h2>
            <p className="text-muted-foreground mb-8">
              Tell us your vehicle and we&apos;ll find compatible batteries.
            </p>
            <BatteryFinderForm />
          </div>
        </div>
      </section>
    </SolutionPageLayout>
  )
}
