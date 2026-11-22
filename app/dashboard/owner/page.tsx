import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { Shell } from '@/components/dashboard/Shell'
import { redirect } from 'next/navigation'
import { OwnerDashboardClient } from '@/components/dashboard/OwnerDashboardClient'

export const dynamic = 'force-dynamic'

export default async function OwnerDashboard() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (!['SUPERADMIN', 'OWNER'].includes(session.role)) redirect('/login?error=forbidden')

  const [users, products, orders, expenses, rawMaterials, payrolls, logs] = await Promise.all([
    prisma.user.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.product.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: { items: { include: { product: true } } },
    }),
    prisma.expense.findMany({ orderBy: { date: 'desc' } }),
    prisma.rawMaterial.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.payroll.findMany({ orderBy: { paidAt: 'desc' }, include: { user: true, employee: true } }),
    prisma.activityLog.findMany({ orderBy: { createdAt: 'desc' }, take: 30 }),
  ])

  const paidOrders = orders.filter((o) => o.paymentStatus === 'PAID')
  const totalRevenue = paidOrders.reduce((s, o) => s + o.totalAmount, 0)
  const pendingRevenue = orders.filter((o) => o.paymentStatus !== 'PAID' && o.status !== 'DELIVERED' && o.status !== 'CANCELLED').reduce((s, o) => s + o.totalAmount, 0)
  const customers = users.filter((u) => u.role === 'CUSTOMER')
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0)
  const netProfit = totalRevenue - totalExpenses
  const totalRawStockValue = rawMaterials.reduce((s, m) => s + Math.round(m.stock * m.unitCost), 0)

  const revenueByMethod = paidOrders.reduce((acc: Record<string, number>, o) => {
    acc[o.paymentMethod] = (acc[o.paymentMethod] || 0) + o.totalAmount
    return acc
  }, {})

  const dayBuckets: { label: string; total: number }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() - i)
    const next = new Date(d)
    next.setDate(d.getDate() + 1)
    const total = paidOrders
      .filter((o) => {
        const t = new Date(o.createdAt).getTime()
        return t >= d.getTime() && t < next.getTime()
      })
      .reduce((s, o) => s + o.totalAmount, 0)
    dayBuckets.push({ label: d.toLocaleDateString('id-ID', { weekday: 'short' }), total })
  }

  return (
    <Shell
      title="Pusat Kendali Owner"
      subtitle={`${session.name} · Pengawasan Eksekutif Lintas Divisi & Akun Internal`}
      role={session.role}
      current="owner"
    >
      <OwnerDashboardClient
        users={users}
        products={products}
        orders={orders}
        expenses={expenses}
        rawMaterials={rawMaterials}
        payrolls={payrolls}
        logs={logs}
        metrics={{
          totalRevenue,
          pendingRevenue,
          totalExpenses,
          netProfit,
          totalRawStockValue,
          customerCount: customers.length,
        }}
        dayBuckets={dayBuckets}
        revenueByMethod={revenueByMethod}
      />
    </Shell>
  )
}
