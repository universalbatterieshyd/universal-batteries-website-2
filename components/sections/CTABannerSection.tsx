'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export type CTABannerConfig = {
  headline?: string
  subtext?: string
  buttonText?: string
  buttonLink?: string
  variant?: 'primary' | 'secondary'
}

export default function CTABannerSection({ config }: { config?: CTABannerConfig | null }) {
  const headline = config?.headline ?? 'Ready to Get Started?'
  const subtext =
    config?.subtext ?? 'Contact us today for expert advice and same-day delivery.'
  const buttonText = config?.buttonText ?? 'Contact Us'
  const buttonLink = config?.buttonLink ?? '#contact'
  const variant = config?.variant ?? 'primary'

  const isPrimary = variant === 'primary'

  return (
    <section
      className={`py-20 ${isPrimary ? 'gradient-subtle' : 'bg-muted/50'}`}
    >
      <div className="container mx-auto px-6 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            {headline}
          </h2>
          <p className="text-lg text-muted-foreground mb-8">{subtext}</p>
          <Button size="lg" asChild={!!buttonLink} variant={isPrimary ? 'default' : 'outline'}>
            {buttonLink ? (
              <Link href={buttonLink}>{buttonText}</Link>
            ) : (
              <span>{buttonText}</span>
            )}
          </Button>
        </div>
      </div>
    </section>
  )
}
