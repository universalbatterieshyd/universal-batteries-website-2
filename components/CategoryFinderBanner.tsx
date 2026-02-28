'use client'

import Link from 'next/link'
import { Battery, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'

type CategoryFinderBannerProps = {
  type: 'battery' | 'power-backup'
}

export function CategoryFinderBanner({ type }: CategoryFinderBannerProps) {
  if (type === 'battery') {
    return (
      <section className="py-12 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent dark:from-primary/20 dark:via-primary/10 border-y border-primary/20">
        <div className="container mx-auto px-6 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/20 text-primary">
                <Battery className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Find the right battery for your vehicle</h2>
                <p className="text-muted-foreground mt-1">
                  Tell us your car make and model — we&apos;ll recommend compatible batteries.
                </p>
              </div>
            </div>
            <Button asChild size="lg" className="shrink-0">
              <Link href="/solutions/home-backup#battery-finder">Find your battery</Link>
            </Button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12 bg-gradient-to-r from-secondary/10 via-secondary/5 to-transparent dark:from-secondary/20 dark:via-secondary/10 border-y border-secondary/20">
      <div className="container mx-auto px-6 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-secondary/20 text-secondary">
              <Zap className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Size your power backup</h2>
              <p className="text-muted-foreground mt-1">
                Calculate load and backup hours — get inverter and battery recommendations.
              </p>
            </div>
          </div>
          <Button asChild size="lg" variant="secondary" className="shrink-0">
            <Link href="/solutions/office-ups#ups-form">Get UPS proposal</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
