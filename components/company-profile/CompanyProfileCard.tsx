'use client'

import { useState } from 'react'
import {
  BatteryCharging,
  Building2,
  Check,
  Copy,
  Download,
  ExternalLink,
  Mail,
  MapPin,
  Phone,
  Sun,
  Wrench,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  buildCompanyVCard,
  type ResolvedCompanyProfile,
} from '@/lib/company-profile'

const CAPABILITY_ICONS = [BatteryCharging, Building2, Sun, Wrench] as const

type Props = {
  profile: ResolvedCompanyProfile
}

export function CompanyProfileCard({ profile }: Props) {
  const [copied, setCopied] = useState(false)

  const waHref = profile.whatsappNumber
    ? `https://wa.me/${profile.whatsappNumber}?text=${encodeURIComponent(profile.whatsappPrefill)}`
    : null
  const telHref = profile.deskPhoneTel ? `tel:${profile.deskPhoneTel}` : null
  const mailHref = profile.email ? `mailto:${profile.email}` : null
  const pdfUrl = profile.companyProfilePdfUrl.trim() || null

  const saveContact = () => {
    const vcf = buildCompanyVCard(profile)
    const blob = new Blob([vcf], { type: 'text/vcard;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'Universal-Batteries-Secunderabad.vcf'
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const copyGstin = async () => {
    if (!profile.gstin) return
    try {
      await navigator.clipboard.writeText(profile.gstin.trim())
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      /* ignore */
    }
  }

  return (
    <article className="overflow-hidden rounded-none border border-border bg-card text-card-foreground shadow-[0_24px_64px_-28px_rgba(0,0,0,0.35)] sm:rounded-sm">
      {/* Zone 1 — Identity */}
      <header className="relative bg-[hsl(var(--secondary))] px-6 pb-7 pt-8 text-secondary-foreground sm:px-8">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
          aria-hidden
        />
        <div className="relative">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              {profile.logoUrl ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={profile.logoUrl}
                    alt=""
                    className="mb-5 h-11 w-auto max-w-[200px] object-contain object-left"
                  />
                  <h1 className="sr-only">{profile.companyName}</h1>
                </>
              ) : (
                <h1 className="mb-5 text-[1.65rem] font-semibold leading-tight tracking-tight text-white sm:text-[1.85rem]">
                  {profile.companyName}
                </h1>
              )}
              <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-white/55">
                Est. {profile.establishedYear}
              </p>
              <p className="mt-2 max-w-[22rem] text-[13px] leading-relaxed text-white/70">
                {profile.tagline}
              </p>
            </div>
          </div>
        </div>
        <div
          className="absolute inset-x-0 bottom-0 h-[2px]"
          style={{
            background:
              'linear-gradient(90deg, hsl(var(--primary)) 0%, hsl(var(--primary)) 50%, hsl(208 100% 48%) 50%, hsl(208 100% 48%) 100%)',
          }}
          aria-hidden
        />
      </header>

      {/* Zone 2 — Desk actions */}
      <section className="space-y-3 border-b border-border px-5 py-5 sm:px-7 sm:py-6">
        <button
          type="button"
          onClick={saveContact}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-none bg-foreground text-[13px] font-semibold tracking-wide text-background transition active:opacity-90"
        >
          <Download className="h-4 w-4" strokeWidth={2} />
          Save Company Contact
        </button>
        <div className="grid grid-cols-3 gap-2">
          <UtilityLink href={waHref} label="WhatsApp" external>
            <WhatsAppGlyph className="h-4 w-4" />
          </UtilityLink>
          <UtilityLink href={telHref} label="Call Desk">
            <Phone className="h-4 w-4" strokeWidth={1.75} />
          </UtilityLink>
          <UtilityLink href={mailHref} label="Email">
            <Mail className="h-4 w-4" strokeWidth={1.75} />
          </UtilityLink>
        </div>
      </section>

      {/* Zone 3 — Capabilities */}
      <section className="border-b border-border px-5 py-6 sm:px-7">
        <SectionLabel>Capabilities</SectionLabel>
        <div className="mt-4 grid grid-cols-1 border-l border-t border-border sm:grid-cols-2">
          {profile.capabilities.map((cap, index) => {
            const Icon = CAPABILITY_ICONS[index % CAPABILITY_ICONS.length]
            return (
              <div key={cap.title} className="overflow-hidden border-b border-r border-border">
                {cap.imageUrl ? (
                  <div className="aspect-[16/9] bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={cap.imageUrl} alt="" className="h-full w-full object-cover" />
                  </div>
                ) : null}
                <div className="p-4">
                  {cap.imageUrl ? (
                    <h3 className="text-[13px] font-semibold tracking-tight text-foreground">{cap.title}</h3>
                  ) : (
                    <div className="flex items-center gap-2 text-secondary">
                      <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                      <h3 className="text-[13px] font-semibold tracking-tight text-foreground">{cap.title}</h3>
                    </div>
                  )}
                  <p className="mt-2 text-[12.5px] leading-relaxed text-muted-foreground">{cap.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Zone 4 — Brands */}
      <section className="border-b border-border px-5 py-6 sm:px-7">
        <SectionLabel>Brands We Supply</SectionLabel>
        <div className="mt-4 grid grid-cols-2 border-l border-t border-border sm:grid-cols-3">
          {profile.brands.map((brand) => (
            <div
              key={brand.name}
              className="flex min-h-[64px] items-center justify-center border-b border-r border-border px-3 py-3"
            >
              {brand.logoUrl ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={brand.logoUrl}
                    alt=""
                    className="max-h-8 w-auto max-w-full object-contain opacity-90"
                  />
                  <span className="sr-only">{brand.name}</span>
                </>
              ) : (
                <span className="text-center text-[12px] font-medium tracking-wide text-foreground/80">
                  {brand.name}
                </span>
              )}
            </div>
          ))}
        </div>
        <p className="mt-3 text-[11.5px] leading-relaxed text-muted-foreground">
          Genuine OEM supply backed by registered manufacturer warranty.
        </p>
      </section>

      {/* Zone 5 — Locations */}
      <section className="border-b border-border px-5 py-6 sm:px-7">
        <SectionLabel>Locations</SectionLabel>
        <div className="mt-4 space-y-3">
          {profile.branches.map((branch) => (
            <div key={branch.id} className="border border-border p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-[13px] font-semibold text-foreground">{branch.name}</h3>
                    {branch.badge && (
                      <span className="border border-border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                        {branch.badge}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 flex gap-2 text-[12.5px] leading-relaxed text-muted-foreground">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-secondary" strokeWidth={1.75} />
                    <span>{branch.address}</span>
                  </p>
                  {branch.hours && (
                    <p className="mt-1.5 pl-[22px] font-mono text-[11.5px] tabular-nums text-foreground/70">
                      {branch.hours}
                    </p>
                  )}
                </div>
              </div>
              {branch.mapsUrl ? (
                <a
                  href={branch.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 flex h-11 w-full items-center justify-center gap-1.5 border border-border text-[12.5px] font-semibold tracking-wide text-foreground transition hover:bg-muted active:opacity-90"
                >
                  Open in Google Maps
                  <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.75} />
                </a>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      {/* Zone 6 — Business details (only when data exists) */}
      {(profile.legalFirmName || profile.gstin || pdfUrl) && (
        <section className="px-5 py-6 sm:px-7">
          {(profile.legalFirmName || profile.gstin) && (
            <>
              <SectionLabel>Business & Tax Details</SectionLabel>
              <div className="mt-4 space-y-3 border border-border bg-muted/40 p-4">
                {profile.legalFirmName ? (
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                      Legal Firm Name
                    </p>
                    <p className="mt-1 text-[13px] font-medium text-foreground">{profile.legalFirmName}</p>
                  </div>
                ) : null}
                {profile.gstin ? (
                  <div className={profile.legalFirmName ? 'border-t border-border pt-3' : undefined}>
                    <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                      GSTIN
                    </p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <p className="min-w-0 flex-1 truncate font-mono text-[13px] tabular-nums tracking-wide text-foreground">
                        {profile.gstin}
                      </p>
                      <button
                        type="button"
                        onClick={copyGstin}
                        className="inline-flex h-9 shrink-0 items-center gap-1.5 border border-border bg-card px-3 text-[11px] font-semibold uppercase tracking-wider text-foreground transition active:opacity-90"
                        aria-live="polite"
                      >
                        {copied ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-600" strokeWidth={2} />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" strokeWidth={1.75} />
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </>
          )}

          {pdfUrl ? (
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex h-11 w-full items-center justify-center gap-2 border border-border text-[12.5px] font-semibold tracking-wide text-foreground transition hover:bg-muted active:opacity-90"
            >
              <Download className="h-4 w-4" strokeWidth={1.75} />
              Download Company Profile (PDF)
            </a>
          ) : null}
        </section>
      )}
    </article>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
      {children}
    </p>
  )
}

function UtilityLink({
  href,
  label,
  children,
  external,
}: {
  href: string | null
  label: string
  children: React.ReactNode
  external?: boolean
}) {
  const className =
    'flex h-12 flex-col items-center justify-center gap-1 border border-border text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground transition hover:bg-muted active:opacity-90'
  if (!href) {
    return (
      <span className={cn(className, 'cursor-not-allowed opacity-40')} aria-disabled>
        {children}
        {label}
      </span>
    )
  }
  return (
    <a
      href={href}
      className={className}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {children}
      {label}
    </a>
  )
}

function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}
