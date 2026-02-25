'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

export type FAQConfig = {
  title?: string
  subtitle?: string
  items?: { question: string; answer: string }[]
}

const DEFAULT_ITEMS = [
  { question: 'What types of batteries do you sell?', answer: 'We offer automotive, inverter, UPS, solar, and industrial batteries from leading brands.' },
  { question: 'Do you offer installation?', answer: 'Yes, we provide free installation with inverter and automotive battery purchases.' },
  { question: 'What is your delivery area?', answer: 'We deliver across Hyderabad and surrounding areas, with same-day delivery available.' },
]

export default function FAQSection({ config }: { config?: FAQConfig | null }) {
  const title = config?.title ?? 'Frequently Asked Questions'
  const subtitle = config?.subtitle ?? 'Find answers to common questions'
  const items = config?.items?.length ? config.items : DEFAULT_ITEMS

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">{title}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>
        </div>
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {items.map((item, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left">{item.question}</AccordionTrigger>
                <AccordionContent>{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
