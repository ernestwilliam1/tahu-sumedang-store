import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || 'https://tahusumedang.example.com').replace(/\/$/, '')
  // DB bisa belum terjangkau saat build (mis. env belum diset) — sitemap tetap harus terbit.
  const products = await prisma.product
    .findMany({ select: { slug: true, updatedAt: true } })
    .catch(() => [] as { slug: string | null; updatedAt: Date }[])
  const now = new Date()
  return [
    { url: `${base}/`, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/katalog`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${base}/tentang`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/kontak`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/faq`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/syarat-ketentuan`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${base}/kebijakan-privasi`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${base}/login`, lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${base}/register`, lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
    ...products.filter((p) => p.slug).map((p) => ({
      url: `${base}/produk/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
  ]
}
