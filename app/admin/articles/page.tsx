export const dynamic = 'force-dynamic'

import { getSupabaseSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { ArticlesManager } from '@/components/admin/ArticlesManager'
import { supabase } from '@/lib/supabase'

export default async function AdminArticlesPage() {
  const session = await getSupabaseSession()
  if (!session) redirect('/admin/login')

  const { data: articles } = await supabase
    .from('article')
    .select('*')
    .order('created_at', { ascending: false })

  const camel = (articles || []).map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt,
    content: r.content,
    featuredImageUrl: r.featured_image_url,
    isPublished: r.is_published,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }))

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Articles</h1>
      <p className="text-slate-600 mb-8 max-w-2xl">
        Create articles that can be linked from category FAQs. Use markdown for content. Add images with{' '}
        <code className="bg-slate-100 px-1 rounded">![alt](url)</code>.
      </p>
      <ArticlesManager initialArticles={camel} />
    </div>
  )
}
