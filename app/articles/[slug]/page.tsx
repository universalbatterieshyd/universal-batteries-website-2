import { notFound } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { supabase } from '@/lib/supabase'
import { ChevronRight } from 'lucide-react'
import { renderMarkdown } from '@/lib/markdown'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { data } = await supabase.from('article').select('title, excerpt').eq('slug', slug).eq('is_published', true).single()
  if (!data) return { title: 'Article not found' }
  return {
    title: `${data.title} | Universal Batteries`,
    description: data.excerpt || undefined,
  }
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const { data: article, error } = await supabase
    .from('article')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (error || !article) notFound()

  const contentNodes = renderMarkdown(article.content || '')

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20">
        <article className="py-16 md:py-24">
          <div className="container mx-auto px-6 sm:px-6 lg:px-8">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
              <Link href="/articles" className="hover:text-foreground transition-colors">Articles</Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground">{article.title}</span>
            </nav>

            <header className="max-w-3xl mb-12">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">{article.title}</h1>
              {article.excerpt && (
                <p className="text-lg text-muted-foreground">{article.excerpt}</p>
              )}
            </header>

            {article.featured_image_url && (
              <div className="max-w-4xl mb-12 rounded-2xl overflow-hidden shadow-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={article.featured_image_url}
                  alt=""
                  className="w-full h-auto object-cover max-h-[480px]"
                />
              </div>
            )}

            <div className="max-w-3xl prose prose-slate dark:prose-invert prose-headings:font-bold prose-img:rounded-2xl prose-img:shadow-lg">
              {contentNodes}
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  )
}
