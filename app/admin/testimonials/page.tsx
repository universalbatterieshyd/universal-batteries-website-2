export const dynamic = 'force-dynamic';
import { supabase } from '@/lib/supabase'
import { TestimonialsManager } from '@/components/admin/TestimonialsManager'
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
    <div>
      <h1 className="text-2xl font-heading font-bold text-gray-900 mb-2">
        Testimonials
      </h1>
      <p className="text-gray-500 mb-8">
        Manage customer testimonials
      </p>
      <TestimonialsManager initialTestimonials={testimonials} />
    </div>
  )
}
