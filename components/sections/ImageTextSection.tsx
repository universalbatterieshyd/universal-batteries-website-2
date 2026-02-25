'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export type ImageTextConfig = {
  imageUrl?: string
  heading?: string
  body?: string
  ctaText?: string
  ctaLink?: string
  imagePosition?: 'left' | 'right'
}

export default function ImageTextSection({ config }: { config?: ImageTextConfig | null }) {
  const imageUrl = config?.imageUrl ?? '/placeholder.svg'
  const heading = config?.heading ?? 'Quality & Service'
  const body =
    config?.body ??
    'We deliver genuine products with expert guidance and same-day service across the region.'
  const ctaText = config?.ctaText ?? 'Learn More'
  const ctaLink = config?.ctaLink ?? '#'
  const imagePosition = config?.imagePosition ?? 'right'

  const content = (
    <>
      <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">{heading}</h2>
      <p className="text-lg text-muted-foreground mb-6">{body}</p>
      {ctaText && (
        <Button asChild>
          <Link href={ctaLink}>{ctaText}</Link>
        </Button>
      )}
    </>
  )

  const imageBlock = (
    <div className="relative aspect-video rounded-xl overflow-hidden bg-muted">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt={heading}
        className="w-full h-full object-cover"
      />
    </div>
  )

  return (
    <section className="py-20 gradient-subtle">
      <div className="container mx-auto px-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {imagePosition === 'left' ? (
            <>
              {imageBlock}
              <div>{content}</div>
            </>
          ) : (
            <>
              <div>{content}</div>
              {imageBlock}
            </>
          )}
        </div>
      </div>
    </section>
  )
}
