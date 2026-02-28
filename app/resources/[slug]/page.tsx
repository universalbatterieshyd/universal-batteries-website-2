import { notFound } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

const RESOURCES: Record<string, { title: string; content: string; links?: { label: string; href: string }[] }> = {
  'home-backup-solar-hyderabad': {
    title: "Homeowner's guide to backup and solar in Hyderabad",
    content: `
## Why backup power matters in Hyderabad

Power cuts are common in Hyderabad, especially during summer. A reliable inverter and battery keep your lights, fans, and essential appliances running. Here's what you need to know.

## Inverter batteries: Tall tubular vs SMF

**Tall tubular** batteries are the most common for home backup. They last 3–5 years with proper maintenance and are cost-effective. **SMF (maintenance-free)** batteries are sealed and require no topping up, but typically cost more.

## Sizing your system

A rough guide: 1 kW load for 2 hours needs about 150–200 Ah battery (12V) with a 1.5–2 kVA inverter. For lights and fans only, a 600–800 VA inverter with 100–120 Ah battery is often enough.

## Solar option

If you have frequent power cuts or want to reduce grid dependency, add solar panels. Solar charges the battery during the day; the inverter uses it at night. This is called off-grid solar.

## Next steps

Visit our Home Backup solution page to get a personalised recommendation, or use the battery finder if you need a car battery replacement.
`,
    links: [
      { label: 'Home Backup', href: '/solutions/home-backup' },
      { label: 'Battery Finder', href: '/solutions/home-backup#battery-finder' },
    ],
  },
  'choose-right-ups-office': {
    title: 'How to choose the right UPS for your office',
    content: `
## Offline vs online UPS

**Offline (inverter-type)** UPS is suitable for general office use — computers, lights, fans. Backup time: 1–2 hours typical. Cost-effective.

**Online UPS** provides continuous power with zero transfer time. Essential for servers, datacentres, biomedical equipment. Backup: 5 min–1.5 hr. Higher cost.

## Load calculation

List all equipment: PCs, monitors, servers, ACs. Add wattage. Use power factor 0.8. Example: 10 PCs × 200W = 2000W. Add 20% buffer. Choose UPS with VA ≥ (Watts / 0.8).

## Backup hours

How long do you need backup? 30 min for shutdown? 2 hr for extended work? More backup = more batteries = higher cost.

## AMC and maintenance

Annual Maintenance Contracts keep your UPS in good shape. Batteries need replacement every 3–5 years. Plan for it.

## Next steps

Request a UPS proposal with your load and backup requirements.
`,
    links: [{ label: 'Request UPS Proposal', href: '/solutions/office-ups#ups-form' }],
  },
  'solar-basics-hyderabad': {
    title: 'Solar basics: Off-grid vs on-grid',
    content: `
## Off-grid solar

Off-grid means no connection to the grid. Solar panels charge batteries; inverter powers your load. Ideal for:
- Areas with frequent power cuts
- Remote locations with poor grid supply
- Loads that must run 24/7

You need: solar panels, charge controller, inverter, batteries.

## On-grid solar

On-grid connects to the grid. Excess power is fed back; you get credits (net metering). No batteries. Ideal for:
- Stable grid supply
- Reducing electricity bills
- Offices, shops, factories

Sizing: based on roof area and monthly bill. 1 kW ≈ 100–120 sq ft. 5 kW can offset ₹5,000–8,000/month bill (Hyderabad rates).

## Net metering in Hyderabad

TS discoms support net metering. Excess solar is credited to your bill. Payback: typically 4–6 years.

## Next steps

Home solar for off-grid. Business solar for on-grid and site survey.
`,
    links: [
      { label: 'Home Solar', href: '/solutions/home-solar' },
      { label: 'Business Solar', href: '/solutions/business-solar' },
    ],
  },
}

export default async function ResourcePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const resource = RESOURCES[slug]
  if (!resource) notFound()

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20">
        <section className="relative py-12 overflow-hidden bg-slate-50 dark:bg-slate-900/50">
          <div className="container mx-auto px-6 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
              <ChevronRight className="h-4 w-4" />
              <Link href="/resources" className="hover:text-foreground transition-colors">Resources</Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground">{resource.title}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">{resource.title}</h1>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-6 sm:px-6 lg:px-8">
            <article className="max-w-3xl prose prose-slate dark:prose-invert prose-headings:font-bold">
              {resource.content.split('\n').map((line, i) => {
                if (line.startsWith('## ')) {
                  return <h2 key={i} className="text-xl mt-8 mb-4">{line.slice(3)}</h2>
                }
                if (line.startsWith('### ')) {
                  return <h3 key={i} className="text-lg mt-6 mb-3">{line.slice(4)}</h3>
                }
                if (line.startsWith('- ')) {
                  return <p key={i} className="my-1 ml-4 text-muted-foreground">• {line.slice(2)}</p>
                }
                if (line.trim() === '') return <br key={i} />
                const html = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                return <p key={i} className="my-2 text-muted-foreground" dangerouslySetInnerHTML={{ __html: html }} />
              })}
            </article>
            {resource.links && resource.links.length > 0 && (
              <div className="mt-12 flex flex-wrap gap-4">
                {resource.links.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
                  >
                    {l.label} <ChevronRight className="h-4 w-4" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
