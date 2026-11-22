import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { getUserProfile } from '@/lib/actions'
import { StoreClient } from '@/components/StoreClient'

// Stok tampil real-time; render per request agar build tidak butuh koneksi DB.
export const dynamic = 'force-dynamic'

export default async function Home() {
  const [products, session, userProfile] = await Promise.all([
    prisma.product.findMany({ orderBy: { createdAt: 'desc' } }),
    getSession(),
    getUserProfile(),
  ])
  const sess = session ? { name: session.name, role: session.role } : null
  const base = (process.env.NEXT_PUBLIC_SITE_URL || 'https://tahusumedang.example.com').replace(/\/$/, '')
  const orgLd = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: 'Tahu Sumedang Official',
    url: base,
    description: 'Tahu Sumedang digoreng segar setiap pesanan — renyah di luar, lembut kopong di dalam.',
    priceRange: 'IDR',
  }
  const listLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: products.slice(0, 10).map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${base}/produk/${p.slug ?? p.id}`,
      name: p.name,
    })),
  }
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(listLd) }} />
      <StoreClient products={products} session={sess} userProfile={userProfile} />
    </>
  )
}