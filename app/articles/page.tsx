import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export default async function ArticlesPage() {
  const { data: articles } = await supabase
    .from('article')
    .select('slug, title, excerpt, featured_image_url')
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20">
        <section className="relative py-20 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <div className="container relative mx-auto px-6 sm:px-6 lg:px-8">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Articles</h1>
            <p className="text-xl text-slate-300 max-w-2xl">
              In-depth guides and articles linked from our category FAQs.
            </p>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-6 sm:px-6 lg:px-8">
            {articles && articles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {articles.map((a) => (
                  <Link
                    key={a.slug}
                    href={`/articles/${a.slug}`}
                    className="group rounded-2xl border border-slate-200 dark:border-slate-700 bg-card overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all"
                  >
                    {a.featured_image_url && (
                      <div className="aspect-video overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={a.featured_image_url}
                          alt=""
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <h2 className="text-xl font-semibold text-foreground mb-2">{a.title}</h2>
                      {a.excerpt && (
                        <p className="text-muted-foreground mb-4 line-clamp-2">{a.excerpt}</p>
                      )}
                      <span className="inline-flex items-center gap-1 text-primary font-medium">
                        Read article <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-16">No articles published yet.</p>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
