export const dynamic = 'force-dynamic'
import { getSupabaseSession } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import {
  MapPin,
  Star,
  Package,
  Inbox,
  ArrowRight,
  Home,
  AlertCircle,
  TrendingUp,
  FolderTree,
} from 'lucide-react'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export default async function AdminDashboardPage() {
  const session = await getSupabaseSession()
  if (!session) return null

  const [branchesRes, testimonialsRes, productsRes, categoriesRes, contactsRes, enterpriseRes] =
    await Promise.all([
      supabase.from('branch').select('id', { count: 'exact', head: true }),
      supabase.from('testimonial').select('id', { count: 'exact', head: true }),
      supabase.from('product').select('id', { count: 'exact', head: true }),
      supabase.from('product_category').select('id', { count: 'exact', head: true }),
      supabase.from('contact_submission').select('id, contacted'),
      supabase.from('enterprise_lead').select('id, contacted'),
    ])

  const branchesCount = branchesRes.count ?? 0
  const testimonialsCount = testimonialsRes.count ?? 0
  const productsCount = productsRes.count ?? 0
  const categoriesCount = categoriesRes.count ?? 0
  const contactCount = contactsRes.data?.length ?? 0
  const enterpriseCount = enterpriseRes.data?.length ?? 0
  const uncontactedContacts = contactsRes.data?.filter((c) => !c.contacted).length ?? 0
  const uncontactedEnterprise = enterpriseRes.data?.filter((e) => !e.contacted).length ?? 0
  const totalUncontacted = uncontactedContacts + uncontactedEnterprise

  const stats = [
    {
      label: 'Categories',
      value: categoriesCount,
      href: '/admin/categories',
      icon: FolderTree,
      color: 'from-violet-500 to-purple-600',
      bgLight: 'bg-violet-50',
      iconColor: 'text-violet-600',
    },
    {
      label: 'Homepage',
      value: 'Edit',
      href: '/admin/homepage',
      icon: Home,
      color: 'from-violet-500 to-purple-600',
      bgLight: 'bg-violet-50',
      iconColor: 'text-violet-600',
    },
    {
      label: 'Branches',
      value: branchesCount,
      href: '/admin/branches',
      icon: MapPin,
      color: 'from-blue-500 to-indigo-600',
      bgLight: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      label: 'Testimonials',
      value: testimonialsCount,
      href: '/admin/testimonials',
      icon: Star,
      color: 'from-amber-500 to-orange-600',
      bgLight: 'bg-amber-50',
      iconColor: 'text-amber-600',
    },
    {
      label: 'Products',
      value: productsCount,
      href: '/admin/products',
      icon: Package,
      color: 'from-emerald-500 to-teal-600',
      bgLight: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
    },
    {
      label: 'Contact Inquiries',
      value: contactCount,
      sub: uncontactedContacts > 0 ? `${uncontactedContacts} new` : null,
      href: '/admin/inquiries',
      icon: Inbox,
      color: 'from-rose-500 to-pink-600',
      bgLight: 'bg-rose-50',
      iconColor: 'text-rose-600',
    },
    {
      label: 'Enterprise Leads',
      value: enterpriseCount,
      sub: uncontactedEnterprise > 0 ? `${uncontactedEnterprise} new` : null,
      href: '/admin/inquiries',
      icon: Inbox,
      color: 'from-sky-500 to-cyan-600',
      bgLight: 'bg-sky-50',
      iconColor: 'text-sky-600',
    },
  ]

  const userEmail = session.user.email ?? 'Staff'

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white px-8 py-8">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-slate-500">{getGreeting()}</p>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">{userEmail}</p>
        </div>
      </div>

      <div className="p-8">
        {/* Alerts */}
        {totalUncontacted > 0 && (
          <Link
            href="/admin/inquiries"
            className="mb-8 flex items-center gap-4 rounded-xl border border-amber-200 bg-amber-50/80 px-6 py-4 transition-colors hover:bg-amber-50"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100">
              <AlertCircle className="h-5 w-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-amber-900">
                {totalUncontacted} inquiry{totalUncontacted !== 1 ? 'ies' : ''} need attention
              </p>
              <p className="text-sm text-amber-700">
                {uncontactedContacts} contact form{uncontactedContacts !== 1 ? 's' : ''},{' '}
                {uncontactedEnterprise} enterprise lead{uncontactedEnterprise !== 1 ? 's' : ''}
              </p>
            </div>
            <ArrowRight className="h-5 w-5 text-amber-600" />
          </Link>
        )}

        {/* Stats grid */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">
            Quick links
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <Link
                  key={stat.label}
                  href={stat.href}
                  className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-slate-300 hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bgLight}`}>
                      <Icon className={`h-6 w-6 ${stat.iconColor}`} strokeWidth={1.75} />
                    </div>
                    <ArrowRight className="h-5 w-5 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-slate-500" />
                  </div>
                  <p className="mt-4 text-sm font-medium text-slate-500">{stat.label}</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    {stat.value}
                  </p>
                  {stat.sub && (
                    <span className="mt-2 inline-block rounded-full bg-[#E31B23]/10 px-2.5 py-0.5 text-xs font-medium text-[#E31B23]">
                      {stat.sub}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        </div>

        {/* Info card */}
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#E31B23]/10">
              <TrendingUp className="h-5 w-5 text-[#E31B23]" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Content at a glance</h3>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                Manage branches, products, and testimonials from the sidebar. Use Homepage to edit the hero,
                reorder sections, and add new content blocks. Inquiries shows all contact and enterprise leads.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
