'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

const SECTIONS = [
  { id: 'home', label: 'Home' },
  { id: 'products', label: 'Products' },
  { id: 'about', label: 'About' },
  { id: 'testimonials', label: 'Reviews' },
  { id: 'contact', label: 'Contact' },
]

const SCROLL_THRESHOLD = 150

export function SectionNav() {
  const pathname = usePathname()
  const [isVisible, setIsVisible] = useState(false)
  const [activeId, setActiveId] = useState<string>('home')

  const isHomePage = pathname === '/'

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > SCROLL_THRESHOLD)
    }
    handleScroll() // check initial state
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      {
        rootMargin: '-20% 0px -70% 0px',
        threshold: 0,
      }
    )

    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id)
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  if (!isHomePage || !isVisible) return null

  return (
    <>
      {/* Desktop: vertical strip on the right */}
      <nav
        className="hidden md:flex fixed right-6 top-1/2 -translate-y-1/2 z-[9990] flex-col gap-2"
        aria-label="Section navigation"
        style={{ bottom: 'max(6rem, 100px)' }}
      >
        {SECTIONS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => scrollToSection(id)}
            className={`group flex items-center justify-end gap-2 py-2.5 pl-4 pr-2 rounded-l-full transition-all duration-200 ${
              activeId === id
                ? 'bg-white/95 dark:bg-slate-800 text-primary shadow-md'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
            aria-label={`Go to ${label}`}
            aria-current={activeId === id ? 'true' : undefined}
          >
            <span className="max-w-0 overflow-hidden opacity-0 group-hover:max-w-[120px] group-hover:opacity-100 group-focus-visible:max-w-[120px] group-focus-visible:opacity-100 transition-all duration-200 text-sm font-medium whitespace-nowrap">
              {label}
            </span>
            <span
              className={`w-2.5 h-2.5 rounded-full shrink-0 transition-all ${
                activeId === id ? 'bg-primary scale-125 ring-2 ring-white/50' : 'bg-muted-foreground/50 group-hover:bg-foreground/50'
              }`}
              aria-hidden
            />
          </button>
        ))}
      </nav>

      {/* Mobile: horizontal bar at bottom */}
      <nav
        className="md:hidden fixed bottom-20 left-4 right-20 z-[9990]"
        aria-label="Section navigation"
      >
        <div className="glass-card rounded-full px-4 py-2 flex items-center gap-1 overflow-x-auto scrollbar-hide">
          {SECTIONS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => scrollToSection(id)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activeId === id
                  ? 'bg-white dark:bg-slate-800 text-primary shadow-md border border-slate-200 dark:border-slate-700'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              aria-label={`Go to ${label}`}
              aria-current={activeId === id ? 'true' : undefined}
            >
              {label}
            </button>
          ))}
        </div>
      </nav>
    </>
  )
}
