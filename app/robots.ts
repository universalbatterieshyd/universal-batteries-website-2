import { MetadataRoute } from 'next'
import { getSiteSettings } from '@/lib/site-settings'

export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await getSiteSettings()
  const baseUrl = settings.site_url || 'https://universalbatteries.co.in'

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
