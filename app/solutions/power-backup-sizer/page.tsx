import { SolutionPageLayout } from '@/components/solutions/SolutionPageLayout'
import { PowerBackupWizard } from '@/components/leads/PowerBackupWizard'
import { Zap } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function PowerBackupSizerPage() {
  return (
    <SolutionPageLayout
      title="Power Backup Calculator"
      tagline="Calculate inverter and battery requirements based on your load and backup hours."
      icon={<Zap className="h-8 w-8" />}
      ctaSection={
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Need home backup or solar?</h2>
          <p className="text-muted-foreground mb-6">
            Get a personalised recommendation for inverter and battery setup.
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
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground mb-2">Calculate your requirements</h2>
            <p className="text-muted-foreground mb-8">
              Add your appliances or enter total load. We&apos;ll recommend inverter and battery capacity.
            </p>
            <div className="rounded-2xl border border-slate-200 bg-white dark:bg-slate-900/50 p-8 shadow-sm">
              <PowerBackupWizard />
            </div>
          </div>
        </div>
      </section>
    </SolutionPageLayout>
  )
}
