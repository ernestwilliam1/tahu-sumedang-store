import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { Shell } from '@/components/dashboard/Shell'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Dashboard from '@/components/ui/dashboard-4'
import { FinanceClient } from '@/components/dashboard/FinanceClient'

export const dynamic = 'force-dynamic'

const ALLOWED = ['SUPERADMIN', 'OWNER', 'FINANCE'] as const

export default async function FinanceDashboardPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (!(ALLOWED as readonly string[]).includes(session.role)) redirect('/login?error=forbidden')

  const [orders, expenses, products, customerCount, users, payrolls, logs] = await Promise.all([
    prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: { items: { include: { product: true } } },
    }),
    prisma.expense.findMany({ orderBy: { date: 'desc' } }),
    prisma.product.findMany({ orderBy: { soldCount: 'desc' } }),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.user.findMany({ where: { role: { not: 'CUSTOMER' } }, orderBy: { createdAt: 'desc' } }),
    prisma.payroll.findMany({ orderBy: { paidAt: 'desc' }, include: { user: true, employee: true } }),
    prisma.activityLog.findMany({ orderBy: { createdAt: 'desc' }, take: 30 }),
  ])
  const staffUsers = users.filter(u => ['ADMIN','STAFF','SUPPLIER','FINANCE'].includes(u.role))

  const isOwnerView = session.role === 'OWNER' || session.role === 'SUPERADMIN'

  return (
    <Shell
      title="Manajemen Keuangan"
      subtitle={`${session.name} · Laporan Laba Rugi, Arus Kas & Rekonsiliasi Real-time`}
      role={session.role}
      current="finance"
    >
      {isOwnerView && (
        <Link
          href="/dashboard/owner"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#E5E2DC] rounded-full text-xs font-bold text-[#1C1917] hover:bg-[#F3F1ED] hover:border-[#D6D3D1] shadow-xs transition"
        >
          <span aria-hidden>←</span> Kembali ke Pusat Kendali Owner
        </Link>
      )}

      {/* Visual KPI & Grafik Keuangan — tersinkronisasi 100% dengan database transaksi */}
      <Dashboard
        orders={orders}
        expenses={expenses}
        products={products}
        customerCount={customerCount}
      />

      <FinanceClient orders={orders} expenses={expenses} role={session.role} staffUsers={staffUsers} payrolls={payrolls} logs={logs} />
    </Shell>
  )
}
