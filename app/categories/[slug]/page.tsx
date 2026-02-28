import { notFound } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { CategoryCTA } from '@/components/CategoryCTA'
import { CategoryFAQWidget } from '@/components/CategoryFAQWidget'
import { CategoryFinderBanner } from '@/components/CategoryFinderBanner'
import { supabase } from '@/lib/supabase'
import { Battery } from 'lucide-react'

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const { data: category, error } = await supabase
    .from('product_category')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !category) notFound()

  const isTopLevel = !category.parent_id

  let subcategories: { id: string; name: string; slug: string }[] = []
  if (isTopLevel) {
    const { data: subs } = await supabase
      .from('product_category')
      .select('id, name, slug')
      .eq('parent_id', category.id)
      .order('order', { ascending: true })
    subcategories = subs || []
  }

  const categoryIds = [category.id, ...subcategories.map((s) => s.id)]

  const { data: products } = await supabase
    .from('product')
    .select('*')
    .in('category_id', categoryIds)
    .eq('is_active', true)
    .order('order', { ascending: true })
    .order('created_at', { ascending: false })

  const heroHeadline = category.hero_headline || category.name
  const heroTagline = category.hero_tagline || category.description || ''
  const hasHeroImage = Boolean(category.hero_image_url?.trim())
  const overview = category.overview || category.description || ''
  const faqItems = (category.faq_items as { question: string; answer: string; moreInfo?: string }[]) || []
  const categorySlug = category.slug as string

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20">
        {/* Hero - image only if set, else gradient (no placeholder) */}
        <section className="relative py-24 overflow-hidden">
          {hasHeroImage ? (
            <>
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${category.hero_image_url})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 to-slate-900/60" />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
          )}
          <div className="container relative mx-auto px-6 sm:px-6 lg:px-8">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4">
              {heroHeadline}
            </h1>
            {heroTagline && (
              <p className="text-xl text-white/90 max-w-2xl">{heroTagline}</p>
            )}
          </div>
        </section>

        {/* Battery finder banner - Automotive only */}
        {categorySlug === 'automotive' && (
          <CategoryFinderBanner type="battery" />
        )}

        {/* Power backup finder banner - UPS / Inverter */}
        {(categorySlug === 'ups' || categorySlug === 'inverter') && (
          <CategoryFinderBanner type="power-backup" />
        )}

        {/* Overview */}
        {overview && (
          <section className="py-20 bg-background">
            <div className="container mx-auto px-6 sm:px-6 lg:px-8">
              <div className="max-w-3xl">
                <h2 className="text-2xl font-bold text-foreground mb-6">Overview</h2>
                <div className="prose prose-slate max-w-none text-muted-foreground whitespace-pre-wrap">
                  {overview}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Subcategories */}
        {subcategories.length > 0 && (
          <section className="py-16 gradient-subtle">
            <div className="container mx-auto px-6 sm:px-6 lg:px-8">
              <h2 className="text-2xl font-bold text-foreground mb-8">Browse by type</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {subcategories.map((sub) => (
                  <Link
                    key={sub.id}
                    href={`/categories/${sub.slug}`}
                    className="glass-card p-6 rounded-2xl hover:scale-[1.02] transition-all"
                  >
                    <h3 className="font-semibold text-foreground">{sub.name}</h3>
                    <span className="text-primary font-medium mt-2 inline-block">Explore →</span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* FAQ - Overview, expandable with More Info */}
        <CategoryFAQWidget items={faqItems} />

        {/* Products */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-6 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-foreground mb-8">Products</h2>
            {products && products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {products.map((p) => (
                  <div
                    key={p.id}
                    className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="aspect-video bg-slate-100 dark:bg-slate-800 relative">
                      {p.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.image_url}
                          alt={p.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700">
                          <Battery className="h-12 w-12 text-slate-400 dark:text-slate-500" />
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="font-semibold text-foreground">{p.title}</h3>
                      {p.description && (
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                          {p.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No products in this category yet.</p>
            )}
          </div>
        </section>

        {/* CTA */}
        <CategoryCTA
          headline={category.cta_headline}
          subtext={category.cta_subtext}
        />
      </main>
      <Footer />
    </div>
  )
}
