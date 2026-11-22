import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { getUserProfile } from '@/lib/actions'
import { StoreClient } from '@/components/StoreClient'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Katalog Menu Tahu Sumedang | Hangat, Renyah & Gurih',
  description: 'Jelajahi seluruh varian menu Tahu Sumedang asli: Paket Besek, Tahu Mercon, Tahu Walik, Tahu Frozen, dan Sambal Kecap.',
}

export default async function KatalogPage() {
  const [products, session, userProfile] = await Promise.all([
    prisma.product.findMany({ orderBy: { createdAt: 'desc' } }),
    getSession(),
    getUserProfile(),
  ])
  const sess = session ? { name: session.name, role: session.role } : null
  return <StoreClient products={products} session={sess} userProfile={userProfile} />
}
