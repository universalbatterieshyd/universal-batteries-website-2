export interface Branch {
  id: string
  name: string
  address: string
  phone: string
  email?: string | null | undefined
  hours?: string | null | undefined
  manager?: string | null | undefined
  mapsUrl?: string | null | undefined
  isMain: boolean
  order?: number
}

export interface Testimonial {
  id: string
  quote: string
  role: string
  area?: string | null | undefined
  customerName?: string | null
  rating: number
  isApproved?: boolean
}

export interface ProductCategory {
  id: string
  name: string
  slug: string
  description?: string | null
  parentId?: string | null
  order?: number
  heroHeadline?: string | null
  heroTagline?: string | null
  heroImageUrl?: string | null
  overview?: string | null
  ctaHeadline?: string | null
  ctaSubtext?: string | null
  faqItems?: { question: string; answer: string }[]
  icon?: string | null
}

export interface Product {
  id: string
  title: string
  slug: string
  description?: string | null
  categoryId: string
  category: ProductCategory
  isActive: boolean
}

export interface Contact {
  id: string
  name: string
  phone: string
  email?: string | null
  queryType: string
  message: string
  contacted: boolean
  notes?: string | null
  createdAt: string | Date
}

export interface Enterprise {
  id: string
  companyName: string
  contactPerson: string
  email: string
  phone: string
  requiredQuantity: string
  timeline: string
  comments?: string | null
  contacted: boolean
  notes?: string | null
  createdAt: string | Date
}
