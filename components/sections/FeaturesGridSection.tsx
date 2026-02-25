'use client'

import {
  Shield,
  Truck,
  Award,
  Headphones,
  ThumbsUp,
  Clock,
  Zap,
  Battery,
  Car,
  Sun,
} from 'lucide-react'

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Shield,
  Truck,
  Award,
  Headphones,
  ThumbsUp,
  Clock,
  Zap,
  Battery,
  Car,
  Sun,
}

export type FeaturesGridConfig = {
  title?: string
  subtitle?: string
  features?: { icon: string; title: string; description: string }[]
}

export default function FeaturesGridSection({ config }: { config?: FeaturesGridConfig | null }) {
  const title = config?.title ?? 'Why Choose Us'
  const subtitle = config?.subtitle ?? 'Your trusted partner for reliable solutions'
  const features = config?.features?.length
    ? config.features
    : [
        { icon: 'Shield', title: 'Genuine Products', description: '100% authentic products' },
        { icon: 'Truck', title: 'Fast Delivery', description: 'Quick and reliable delivery' },
      ]

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
            {title}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, i) => {
            const Icon = ICON_MAP[f.icon] ?? Shield
            return (
              <div
                key={i}
                className="flex flex-col items-center text-center p-6 rounded-xl hover:bg-muted/50 transition-all"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4 shadow-lg">
                  <Icon className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">{f.title}</h3>
                <p className="text-muted-foreground">{f.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
