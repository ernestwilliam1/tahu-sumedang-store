import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { ProfileClient } from '@/components/profile/ProfileClient'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const session = await getSession()
  if (!session) redirect('/login')
  const user = await prisma.user.findUnique({ where: { id: session.userId } })
  if (!user) redirect('/login')
  const orders = await prisma.order.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: 'desc' },
    include: { items: { include: { product: true } } },
  })
  return <ProfileClient user={{ name: user.name, email: user.email, phone: user.phone, address: user.address, city: user.city, role: user.role }} orders={orders} />
}
