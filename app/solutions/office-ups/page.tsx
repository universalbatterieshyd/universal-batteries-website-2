import { SolutionPageLayout } from '@/components/solutions/SolutionPageLayout'
import { UPSProposalForm } from '@/components/leads/UPSProposalForm'
import { Building2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function OfficeUPSPage() {
  return (
    <SolutionPageLayout
      title="Office & UPS"
      tagline="UPS systems and AMC for offices, clinics, datacentres. Keep your business running during power cuts."
      icon={<Building2 className="h-8 w-8" />}
      ctaSection={
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Running an office, clinic or datacentre?</h2>
          <p className="text-muted-foreground mb-6">
            Get a UPS proposal tailored to your load and backup requirements.
          </p>
          <Button asChild size="lg">
            <Link href="/solutions/office-ups#ups-form">Request UPS Proposal</Link>
          </Button>
        </div>
      }
    >
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto prose prose-slate dark:prose-invert">
            <h2>Why UPS for your business?</h2>
            <p>
              Offices, clinics, and datacentres need uninterrupted power. Our UPS solutions range from
              offline inverters for basic backup to online UPS for servers and critical equipment.
            </p>
            <h3>What we offer</h3>
            <ul>
              <li>Offline UPS (1–2 hr backup) for general office use</li>
              <li>Online UPS (5 min–1.5 hr) for servers, biomedical equipment</li>
              <li>AMC and preventive maintenance</li>
              <li>Installation: trolley or metal rack</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="ups-form" className="py-20 gradient-subtle">
        <div className="container mx-auto px-6 sm:px-6 lg:px-8">
          <div className="max-w-xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground mb-2">Request a UPS proposal</h2>
            <p className="text-muted-foreground mb-8">
              Share your requirements and we&apos;ll get back with a tailored quote.
            </p>
            <UPSProposalForm />
          </div>
        </div>
      </section>
    </SolutionPageLayout>
  )
}
