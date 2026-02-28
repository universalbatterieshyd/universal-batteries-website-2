import { SolutionPageLayout } from '@/components/solutions/SolutionPageLayout'
import { SolarEnquiryForm } from '@/components/leads/SolarEnquiryForm'
import { Zap } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function BusinessSolarPage() {
  return (
    <SolutionPageLayout
      title="Business Solar"
      tagline="On-grid solar for businesses. Reduce electricity bills with net metering — no batteries required."
      icon={<Zap className="h-8 w-8" />}
      ctaSection={
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Reduce your electricity bill?</h2>
          <p className="text-muted-foreground mb-6">
            Book a site survey for an on-grid solar estimate.
          </p>
          <Button asChild size="lg">
            <Link href="/solutions/business-solar#solar-form">Book Site Survey</Link>
          </Button>
        </div>
      }
    >
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto prose prose-slate dark:prose-invert">
            <h2>On-grid solar for businesses</h2>
            <p>
              On-grid solar connects to the grid. Excess power is fed back; you get credits. No batteries
              needed — ideal for offices, shops, and factories with stable grid supply. Net metering
              reduces your electricity bill significantly.
            </p>
            <h3>What we offer</h3>
            <ul>
              <li>kW sizing based on roof area and monthly bill</li>
              <li>Net metering setup and approvals</li>
              <li>Installation and commissioning</li>
              <li>Savings estimate and payback period</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="solar-form" className="py-20 gradient-subtle">
        <div className="container mx-auto px-6 sm:px-6 lg:px-8">
          <div className="max-w-xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground mb-2">Book a site survey</h2>
            <p className="text-muted-foreground mb-8">
              Share your roof details and monthly bill for a kW estimate.
            </p>
            <SolarEnquiryForm type="on_grid" />
          </div>
        </div>
      </section>
    </SolutionPageLayout>
  )
}
