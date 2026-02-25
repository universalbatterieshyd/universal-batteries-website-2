export const dynamic = 'force-dynamic';
import { getSupabaseSession } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { MapPin, Star, Package, Inbox, ArrowRight, Home } from 'lucide-react'

export default async function AdminDashboardPage() {
  const session = await getSupabaseSession()
  if (!session) return null

  const [branchesRes, testimonialsRes, productsRes, contactsRes, enterpriseRes] =
    await Promise.all([
      supabase.from('branch').select('id', { count: 'exact', head: true }),
      supabase.from('testimonial').select('id', { count: 'exact', head: true }),
      supabase.from('product').select('id', { count: 'exact', head: true }),
      supabase.from('contact_submission').select('id, contacted'),
      supabase.from('enterprise_lead').select('id, contacted'),
    ])

  const branchesCount = branchesRes.count ?? 0
  const testimonialsCount = testimonialsRes.count ?? 0
  const productsCount = productsRes.count ?? 0
  const contactCount = contactsRes.data?.length ?? 0
  const enterpriseCount = enterpriseRes.data?.length ?? 0
  const uncontactedContacts = contactsRes.data?.filter((c) => !c.contacted).length ?? 0
  const uncontactedEnterprise = enterpriseRes.data?.filter((e) => !e.contacted).length ?? 0

  const stats = [
    { label: 'Homepage', value: '—', href: '/admin/homepage', icon: Home },
    { label: 'Branches', value: branchesCount, href: '/admin/branches', icon: MapPin },
    { label: 'Testimonials', value: testimonialsCount, href: '/admin/testimonials', icon: Star },
    { label: 'Products', value: productsCount, href: '/admin/products', icon: Package },
    { label: 'Contact Inquiries', value: contactCount, sub: `${uncontactedContacts} new`, href: '/admin/inquiries', icon: Inbox },
    { label: 'Enterprise Leads', value: enterpriseCount, sub: `${uncontactedEnterprise} new`, href: '/admin/inquiries', icon: Inbox },
  ]

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold text-gray-900 mb-2">
        Dashboard
      </h1>
      <p className="text-gray-500 mb-8">
        Welcome back, {session.user.email}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md hover:border-energy-red/20 transition-all group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                  <p className="text-3xl font-heading font-bold text-gray-900 mt-1">
                    {stat.value}
                  </p>
                  {stat.sub && (
                    <p className="text-sm text-energy-red mt-1">{stat.sub}</p>
                  )}
                </div>
                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-energy-red/10 transition-colors">
                  <Icon className="w-6 h-6 text-gray-600 group-hover:text-energy-red" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm font-medium text-energy-red">
                View
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
