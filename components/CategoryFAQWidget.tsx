'use client'

import { useState, useMemo } from 'react'
import { Search, ChevronDown, ChevronUp } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'

type FAQItem = { question: string; answer: string; moreInfo?: string }

export function CategoryFAQWidget({ items }: { items: FAQItem[] }) {
  const [query, setQuery] = useState('')
  const [expandedMore, setExpandedMore] = useState<Set<number>>(new Set())

  const filtered = useMemo(() => {
    if (!query.trim()) return items
    const q = query.toLowerCase().trim()
    return items.filter(
      (item) =>
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q) ||
        (item.moreInfo?.toLowerCase().includes(q) ?? false)
    )
  }, [items, query])

  const toggleMore = (i: number) => {
    setExpandedMore((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-foreground mb-8">Frequently Asked Questions</h2>

        {items.length > 0 ? (
          <>
            <div className="max-w-3xl mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search FAQs..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-12 h-12 rounded-xl border-slate-200"
                />
              </div>
            </div>

            <div className="max-w-3xl">
              {filtered.length > 0 ? (
                <Accordion type="multiple" className="w-full">
                  {filtered.map((item, i) => (
                    <AccordionItem key={i} value={`item-${i}`}>
                      <AccordionTrigger className="text-left hover:no-underline">
                        <span className="pr-4">{item.question}</span>
                      </AccordionTrigger>
                      <AccordionContent>
                        <p className="text-muted-foreground">{item.answer}</p>
                        {item.moreInfo && (
                          <div className="mt-4">
                            {expandedMore.has(i) ? (
                              <>
                                <div className="prose prose-slate dark:prose-invert prose-sm max-w-none text-muted-foreground mt-2">
                                  {item.moreInfo}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="mt-2 -ml-2"
                                  onClick={() => toggleMore(i)}
                                >
                                  <ChevronUp className="h-4 w-4 mr-1" />
                                  Show less
                                </Button>
                              </>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="mt-2 -ml-2 text-primary"
                                onClick={() => toggleMore(i)}
                              >
                                <ChevronDown className="h-4 w-4 mr-1" />
                                More info
                              </Button>
                            )}
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <p className="text-muted-foreground py-8">
                  No FAQs match &quot;{query}&quot;. Try a different search term.
                </p>
              )}
            </div>
          </>
        ) : (
          <p className="text-muted-foreground max-w-3xl">
            No FAQs have been added for this category yet.
          </p>
        )}
      </div>
    </section>
  )
}
