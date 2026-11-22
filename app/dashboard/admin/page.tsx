import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { Shell } from '@/components/dashboard/Shell'
import { AdminDashboardClient } from '@/components/dashboard/AdminDashboardClient'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

const ALLOWED = ['SUPERADMIN', 'OWNER', 'ADMIN', 'STAFF'] as const

export default async function AdminDashboard() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (!(ALLOWED as readonly string[]).includes(session.role)) redirect('/login?error=forbidden')
  const [products, orders, customers, logs] = await Promise.all([
    prisma.product.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.order.findMany({ orderBy: { createdAt: 'desc' }, include: { items: { include: { product: true } } } }),
    prisma.user.findMany({ where: { role: 'CUSTOMER' }, orderBy: { createdAt: 'desc' }, select: { id: true, name: true, email: true, phone: true, city: true, createdAt: true } }),
    prisma.activityLog.findMany({ orderBy: { createdAt: 'desc' }, take: 30 }),
  ])
  return (
    <Shell title="Admin" subtitle={`${session.name} · ${session.role}`} role={session.role} current="admin">
      <AdminDashboardClient products={products} orders={orders} role={session.role} customers={customers} logs={logs} />
    </Shell>
  )
}
