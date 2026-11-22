import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { Shell } from '@/components/dashboard/Shell'
import { SupplierBahanBakuClient } from '@/components/dashboard/SupplierBahanBakuClient'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

const ALLOWED = ['SUPERADMIN', 'OWNER', 'SUPPLIER'] as const

export default async function SupplierDashboard() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (!(ALLOWED as readonly string[]).includes(session.role)) redirect('/login?error=forbidden')
  const isOwner = ['SUPERADMIN', 'OWNER'].includes(session.role)

  const materials = isOwner
    ? await prisma.rawMaterial.findMany({ orderBy: { createdAt: 'desc' }, include: { supplier: { select: { name: true } } } })
    : await prisma.rawMaterial.findMany({ where: { supplierId: session.userId }, orderBy: { createdAt: 'desc' }, include: { supplier: { select: { name: true } } } })

  const entries = isOwner
    ? await prisma.stockEntry.findMany({ orderBy: { date: 'desc' }, take: 100, include: { material: { select: { name: true, unit: true } } } })
    : await prisma.stockEntry.findMany({ where: { supplierId: session.userId }, orderBy: { date: 'desc' }, take: 100, include: { material: { select: { name: true, unit: true } } } })

  const logs = await prisma.activityLog.findMany({ orderBy: { createdAt: 'desc' }, take: 30 })

  return (
    <Shell title="Supplier — Bahan Baku" subtitle={isOwner ? `${session.name} · mode owner — semua bahan baku & inbound` : `${session.name} · kelola pasokan bahan baku`} role={session.role} current="supplier">
      <SupplierBahanBakuClient materials={materials as never} entries={entries as never} isOwner={isOwner} logs={logs as never} />
    </Shell>
  )
}
