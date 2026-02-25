export const dynamic = 'force-dynamic'
import { supabase } from '@/lib/supabase'
import { TestimonialsManager } from '@/components/admin/TestimonialsManager'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { toCamelCaseArray } from '@/lib/db-utils'
import type { Testimonial } from '@/types/db'

export default async function TestimonialsPage() {
  const { data } = await supabase
    .from('testimonial')
    .select('*')
    .order('order', { ascending: true })
    .order('created_at', { ascending: false })

  const testimonials = toCamelCaseArray<Testimonial>(data || [])

  return (
    <div className="min-h-screen">
      <AdminPageHeader
        title="Testimonials"
        description="Manage customer testimonials displayed on the site"
      />
      <div className="p-8">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <TestimonialsManager initialTestimonials={testimonials} />
        </div>
      </div>
    </div>
  )
}
