import { SolutionPageLayout } from '@/components/solutions/SolutionPageLayout'
import { UPSProposalForm } from '@/components/leads/UPSProposalForm'
import { Factory } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function FactoryPowerPage() {
  return (
    <SolutionPageLayout
      title="Factory & Industrial Power"
      tagline="Industrial and institutional power solutions. UPS, inverters, and backup for manufacturing and large facilities."
      icon={<Factory className="h-8 w-8" />}
      ctaSection={
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Industrial power requirements?</h2>
          <p className="text-muted-foreground mb-6">
            Get a custom proposal for your facility.
          </p>
          <Button asChild size="lg">
            <Link href="/solutions/factory-power#ups-form">Request Proposal</Link>
          </Button>
        </div>
      }
    >
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto prose prose-slate dark:prose-invert">
            <h2>Industrial power solutions</h2>
            <p>
              Factories, warehouses, and institutions need robust backup power. We provide high-capacity
              inverters, industrial batteries, and UPS systems with installation and support.
            </p>
            <h3>What we offer</h3>
            <ul>
              <li>High-capacity inverters and UPS (10 kVA+)</li>
              <li>Industrial batteries and battery banks</li>
              <li>Custom installation and rack solutions</li>
              <li>AMC and maintenance contracts</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="ups-form" className="py-20 gradient-subtle">
        <div className="container mx-auto px-6 sm:px-6 lg:px-8">
          <div className="max-w-xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground mb-2">Request a proposal</h2>
            <p className="text-muted-foreground mb-8">
              Share your industrial power requirements.
            </p>
            <UPSProposalForm source="factory" />
          </div>
        </div>
      </section>
    </SolutionPageLayout>
  )
}
