import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { getUserProfile } from '@/lib/actions'
import { StoreClient } from '@/components/StoreClient'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await prisma.product.findUnique({ where: { slug } })
  const base = (process.env.NEXT_PUBLIC_SITE_URL || 'https://tahusumedang.example.com').replace(/\/$/, '')
  if (!product) return { title: 'Produk Tidak Ditemukan | Tahu Sumedang' }
  const title = `${product.name} | Tahu Sumedang Asli`
  const description = product.description || 'Tahu Sumedang asli renyah goreng dadakan khas Priangan.'
  const url = `${base}/produk/${slug}`
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: 'article', images: [{ url: `${base}/opengraph-image`, width: 1200, height: 630 }] },
    twitter: { card: 'summary_large_image', title, description },
  }
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [product, allProducts, session, userProfile] = await Promise.all([
    prisma.product.findUnique({ where: { slug } }),
    prisma.product.findMany({ orderBy: { createdAt: 'desc' } }),
    getSession(),
    getUserProfile(),
  ])

  if (!product) notFound()

  const sess = session ? { name: session.name, role: session.role } : null
  const base = (process.env.NEXT_PUBLIC_SITE_URL || 'https://tahusumedang.example.com').replace(/\/$/, '')
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || undefined,
    category: product.category,
    offers: { '@type': 'Offer', price: product.price, priceCurrency: 'IDR', availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock', url: `${base}/produk/${product.slug}` },
    aggregateRating: product.reviewCount ? { '@type': 'AggregateRating', ratingValue: product.rating, reviewCount: product.reviewCount } : undefined,
  }
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <StoreClient products={allProducts} session={sess} userProfile={userProfile} initialSelectedProduct={product} />
    </>
  )
}
