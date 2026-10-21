import type { MetadataRoute } from 'next'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  const staticRoutes = [
    '',
    '/shop',
    '/shop/new-arrivals',
    '/shop/bestsellers',
    '/shop/men',
    '/shop/women',
    '/shop/t-shirts',
    '/shop/shirts',
    '/shop/hoodies',
    '/shop/trousers',
    '/about',
    '/contact',
    '/faqs',
    '/shipping',
    '/returns',
    '/privacy',
    '/terms',
    '/auth/login',
    '/auth/register',
  ]

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === '' ? 'daily' : 'weekly',
    priority: path === '' ? 1.0 : path.startsWith('/shop') ? 0.9 : 0.5,
  }))

  const products = await db.product.findMany({
    where: { isActive: true },
    select: { slug: true, updatedAt: true },
  })

  const productEntries: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${siteUrl}/product/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  return [...staticEntries, ...productEntries]
}
