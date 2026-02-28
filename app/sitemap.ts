import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'
import { getSiteSettings } from '@/lib/site-settings'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const settings = await getSiteSettings()
  const baseUrl = settings.site_url || 'https://universalbatteries.co.in'

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/solutions`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/solutions/home-backup`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/solutions/office-ups`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/solutions/factory-power`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/solutions/home-solar`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/solutions/business-solar`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/resources`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/resources/home-backup-solar-hyderabad`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/resources/choose-right-ups-office`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/resources/solar-basics-hyderabad`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
  ]

  let categoryPages: MetadataRoute.Sitemap = []
  try {
    const { data: categories } = await supabase
      .from('product_category')
      .select('slug')
      .order('order', { ascending: true })
    categoryPages = (categories || []).map((c) => ({
      url: `${baseUrl}/categories/${c.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))
  } catch {
    // ignore
  }

  return [...staticPages, ...categoryPages]
}
