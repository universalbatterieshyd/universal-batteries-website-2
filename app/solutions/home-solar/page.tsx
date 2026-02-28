import { SolutionPageLayout } from '@/components/solutions/SolutionPageLayout'
import { SolarEnquiryForm } from '@/components/leads/SolarEnquiryForm'
import { Sun } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function HomeSolarPage() {
  return (
    <SolutionPageLayout
      title="Home Solar"
      tagline="Off-grid solar for homes. Combine solar charging with your inverter for remote areas and frequent power cuts."
      icon={<Sun className="h-8 w-8" />}
      ctaSection={
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Need home backup or solar?</h2>
          <p className="text-muted-foreground mb-6">
            Get a solar + inverter solution for your home.
          </p>
          <Button asChild size="lg">
            <Link href="/solutions/home-solar#solar-form">Enquire Now</Link>
          </Button>
        </div>
      }
    >
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto prose prose-slate dark:prose-invert">
            <h2>Off-grid solar for homes</h2>
            <p>
              Off-grid solar combines solar panels with an inverter and battery. Ideal for areas with
              frequent power cuts or limited grid supply. Solar charges the battery during the day;
              the inverter powers your home at night.
            </p>
            <h3>What we offer</h3>
            <ul>
              <li>Solar panels and inverters with built-in charge controller</li>
              <li>Battery sizing based on your load</li>
              <li>Installation and wiring</li>
              <li>Maintenance support</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="solar-form" className="py-20 gradient-subtle">
        <div className="container mx-auto px-6 sm:px-6 lg:px-8">
          <div className="max-w-xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground mb-2">Solar enquiry</h2>
            <p className="text-muted-foreground mb-8">
              Tell us about your roof and power needs.
            </p>
            <SolarEnquiryForm type="off_grid" />
          </div>
        </div>
      </section>
    </SolutionPageLayout>
  )
}
