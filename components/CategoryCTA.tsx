'use client'

export function CategoryCTA({
  headline,
  subtext,
}: {
  headline?: string | null
  subtext?: string | null
}) {
  return (
    <section className="py-20 gradient-subtle">
      <div className="container mx-auto px-6 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            {headline || 'Need help choosing?'}
          </h2>
          <p className="text-lg text-muted-foreground">
            {subtext || 'Our team is ready to help you find the right solution. Use the WhatsApp widget for instant support.'}
          </p>
        </div>
      </div>
    </section>
  )
}
