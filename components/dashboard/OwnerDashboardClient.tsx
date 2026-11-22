'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { formatRupiah } from '@/lib/utils'
import { OwnerAdminsClient } from './OwnerAdminsClient'
import { PayrollManager } from './PayrollManager'
import { ActivityFeed } from './ActivityFeed'
import { StockAlerts } from './StockAlerts'
import Dashboard from '@/components/ui/dashboard-4'

type ProductLite = { id: number; name: string; price: number; stock: number; category: string; soldCount: number }
type OrderLite = {
  id: number
  orderNumber: string
  customerName: string
  totalAmount: number
  status: string
  paymentStatus: string
  paymentMethod: string
  createdAt: Date
  items: { product: { name: string } }[]
}
type ExpenseLite = { id: number; amount: number; category: string; date: Date }
type RawMatLite = { id: number; name: string; stock: number; unit: string; unitCost: number }
type UserLite = { id: number; name: string; email: string; role: string; phone: string | null; baseSalary: number | null; createdAt: Date }
type PayLite = { id: string; userId: number | null; employeeId: string | null; amount: number; month: string; status: string; paidAt: Date; createdAt: Date; user: UserLite | null; employee: { name: string; position: string } | null }
type LogLite = { id: string; role: string; action: string; message: string; createdAt: Date }

type TabId = 'ringkasan' | 'pesanan' | 'inventaris' | 'keuangan' | 'kinerja' | 'tim' | 'penggajian' | 'aktivitas'

const TABS: { id: TabId; label: string; desc: string; icon: React.ReactNode }[] = [
  { id: 'ringkasan', label: 'Ringkasan', desc: 'Ringkasan', icon: <IconGrid /> },
  { id: 'pesanan', label: 'Pesanan', desc: 'Pesanan', icon: <IconClipboard /> },
  { id: 'inventaris', label: 'Inventaris', desc: 'Inventaris', icon: <IconBox /> },
  { id: 'keuangan', label: 'Keuangan', desc: 'Keuangan', icon: <IconWallet /> },
  { id: 'kinerja', label: 'Kinerja', desc: 'Kinerja', icon: <IconChart /> },
  { id: 'tim', label: 'Tim', desc: 'Tim', icon: <IconTeam /> },
  { id: 'penggajian', label: 'Penggajian', desc: 'Penggajian', icon: <IconWallet /> },
  { id: 'aktivitas', label: 'Aktivitas', desc: 'Aktivitas', icon: <IconClipboard /> },
]

function IconGrid() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  )
}
function IconClipboard() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75M18 9.75V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08H15c1.012 0 1.867.668 2.15 1.586M18 9.75V18a2.25 2.25 0 01-2.25 2.25H6.622A2.25 2.25 0 014.375 18V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15 6.75a2.25 2.25 0 00-.1-.664 2.25 2.25 0 00 0 0" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6M9 15h6M9 18h6" />
    </svg>
  )
}
function IconBox() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
  )
}
function IconWallet() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 9.75h10.5a2.25 2.25 0 002.25-2.25v-6.375a2.25 2.25 0 00-2.25-2.25H6a2.25 2.25 0 00-2.25 2.25v6.375A2.25 2.25 0 006 16.5h.75m11.25-11.25h.008v.008h-.008V5.25zm3 0h.008v.008h-.008V5.25z" />
    </svg>
  )
}
function IconChart() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  )
}
function IconTeam() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  )
}

export function OwnerDashboardClient({
  users,
  products,
  orders,
  expenses,
  rawMaterials,
  payrolls,
  logs,
  metrics,
  dayBuckets,
  revenueByMethod,
}: {
  users: UserLite[]
  products: ProductLite[]
  orders: OrderLite[]
  expenses: ExpenseLite[]
  rawMaterials: RawMatLite[]
  payrolls: PayLite[]
  logs: LogLite[]
  metrics: { totalRevenue: number; pendingRevenue: number; totalExpenses: number; netProfit: number; totalRawStockValue: number; customerCount: number }
  dayBuckets: { label: string; total: number }[]
  revenueByMethod: Record<string, number>
}) {
  const [active, setActive] = useState<TabId>('ringkasan')
  const [orderSearch, setOrderSearch] = useState('')
  const [orderStatus, setOrderStatus] = useState('ALL')
  const [invSearch, setInvSearch] = useState('')

  const maxDay = Math.max(1, ...dayBuckets.map((b) => b.total))
  const maxRev = Math.max(1, ...Object.values(revenueByMethod))
  const lowStock = useMemo(() => products.filter((p) => p.stock < 15), [products])

  const filteredOrders = useMemo(
    () =>
      orders.filter((o) => {
        const m1 = o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) || o.customerName.toLowerCase().includes(orderSearch.toLowerCase())
        const m2 = orderStatus === 'ALL' || o.status === orderStatus
        return m1 && m2
      }),
    [orders, orderSearch, orderStatus]
  )

  const filteredInv = useMemo(
    () => products.filter((p) => p.name.toLowerCase().includes(invSearch.toLowerCase())),
    [products, invSearch]
  )

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Sidebar nav */}
      <aside className="lg:col-span-3 bg-white border border-[#E5E2DC] rounded-2xl p-3 shadow-[0_2px_8px_rgba(28,25,23,0.04)] lg:sticky lg:top-6">
        <div className="px-3 py-2 border-b border-[#E5E2DC] mb-2 hidden lg:block">
          <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-[#78716C]">Menu</span>
        </div>
        <nav className="flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0 -mx-1 px-1 lg:mx-0 lg:px-0">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              className={`flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all text-left shrink-0 lg:w-full ${active === t.id ? 'bg-[#1C1917] text-white shadow-sm' : 'text-[#57534E] hover:bg-[#F3F1ED] hover:text-[#1C1917] border border-transparent hover:border-[#E5E2DC]'}`}
            >
              <span className={active === t.id ? 'text-white' : 'text-[#78716C]'}>{t.icon}</span>
              <span className="flex flex-col items-start leading-none">
                <span>{t.label}</span>
                <span className={`text-[10px] font-medium mt-0.5 ${active === t.id ? 'text-white/60' : 'text-[#A8A29E]'}`}>{t.desc}</span>
              </span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Content */}
      <div className="lg:col-span-9 min-w-0">
        <AnimatePresence mode="wait">
          {active === 'ringkasan' && (
            <motion.div key="ringkasan" initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }} transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }} className="space-y-6">
              <StockAlerts threshold={15} />
              <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-4 gap-4">
                <div className="p-4 sm:p-5 bg-white border border-[#E5E2DC] rounded-2xl shadow-xs flex flex-col min-h-[118px] overflow-hidden">
                  <span className="block text-[10px] font-bold tracking-[0.14em] uppercase text-[#78716C] leading-none">Pendapatan</span>
                  <span className="block text-lg sm:text-xl font-extrabold tabular-nums text-[#059669] mt-2.5 leading-none tracking-tight break-all">{formatRupiah(metrics.totalRevenue)}</span>
                  <span className="block text-[11px] leading-snug text-[#78716C] mt-1.5 break-words">Tertunda: {formatRupiah(metrics.pendingRevenue)}</span>
                </div>
                <div className="p-4 sm:p-5 bg-white border border-[#E5E2DC] rounded-2xl shadow-xs flex flex-col min-h-[118px] overflow-hidden">
                  <span className="block text-[10px] font-bold tracking-[0.14em] uppercase text-[#78716C] leading-none">Beban</span>
                  <span className="block text-lg sm:text-xl font-extrabold tabular-nums text-[#DC2626] mt-2.5 leading-none tracking-tight break-all">{formatRupiah(metrics.totalExpenses)}</span>
                  <span className="block text-[11px] leading-snug text-[#78716C] mt-1.5">{expenses.length} entri</span>
                </div>
                <div className="p-4 sm:p-5 bg-white border border-[#E5E2DC] rounded-2xl shadow-xs flex flex-col min-h-[118px] overflow-hidden">
                  <span className="block text-[10px] font-bold tracking-[0.14em] uppercase text-[#78716C] leading-none">Laba Bersih</span>
                  <span className={`block text-lg sm:text-xl font-extrabold tabular-nums mt-2.5 leading-none tracking-tight break-all ${metrics.netProfit >= 0 ? 'text-[#059669]' : 'text-[#DC2626]'}`}>{formatRupiah(metrics.netProfit)}</span>
                  <span className="block text-[11px] leading-snug text-[#78716C] mt-1.5">Margin {metrics.totalRevenue ? ((metrics.netProfit / metrics.totalRevenue) * 100).toFixed(1) : '0'}%</span>
                </div>
                <div className="p-4 sm:p-5 bg-white border border-[#E5E2DC] rounded-2xl shadow-xs flex flex-col min-h-[118px] overflow-hidden">
                  <span className="block text-[10px] font-bold tracking-[0.14em] uppercase text-[#78716C] leading-none">Pelanggan</span>
                  <span className="block text-lg sm:text-xl font-extrabold tabular-nums text-[#D97706] mt-2.5 leading-none tracking-tight">{metrics.customerCount} Pelanggan</span>
                  <span className="block text-[11px] leading-snug text-[#78716C] mt-1.5 break-all">Stok bahan {formatRupiah(metrics.totalRawStockValue)}</span>
                </div>
              </div>

              {lowStock.length > 0 && (
                <div className="p-4 bg-[#FEF3C7]/70 border border-[#FDE68A] rounded-2xl flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-[#92400E]">Stok menipis — {lowStock.length} varian</p>
                    <p className="text-[11px] text-[#92400E]/80 mt-0.5">{lowStock.map((p) => `${p.name} (${p.stock})`).join(' · ')}</p>
                  </div>
                  <button onClick={() => setActive('inventaris')} className="px-3 py-1.5 bg-[#D97706] text-white text-xs font-bold rounded-lg shrink-0">Kelola</button>
                </div>
              )}

              <div className="p-4 bg-white border border-[#E5E2DC] rounded-2xl shadow-xs flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs font-bold text-[#1C1917]">Lintas Divisi</span>
                <div className="flex flex-wrap gap-2">
                  <Link href="/dashboard/admin" className="px-3.5 py-1.5 bg-[#FAF9F6] border border-[#E5E2DC] hover:border-[#D97706] rounded-xl text-xs font-bold text-[#1C1917] transition">→ Katalog</Link>
                  <Link href="/dashboard/supplier" className="px-3.5 py-1.5 bg-[#FAF9F6] border border-[#E5E2DC] hover:border-[#059669] rounded-xl text-xs font-bold text-[#1C1917] transition">→ Bahan Baku</Link>
                  <Link href="/dashboard/finance" className="px-3.5 py-1.5 bg-[#FAF9F6] border border-[#E5E2DC] hover:border-[#92400E] rounded-xl text-xs font-bold text-[#1C1917] transition">→ Keuangan</Link>
                </div>
              </div>

              <div className="p-6 bg-white border border-[#E5E2DC] rounded-2xl shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-[#1C1917]">Pesanan Terbaru</h3>
                  </div>
                  <button onClick={() => setActive('pesanan')} className="text-xs font-bold text-[#D97706] hover:underline">Lihat Semua →</button>
                </div>
                <div className="divide-y divide-[#E5E2DC]">
                  {orders.slice(0, 5).map((o) => (
                    <div key={o.id} className="py-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <span className="font-mono text-xs font-bold text-[#D97706]">{o.orderNumber}</span>
                        <span className="block text-xs font-bold text-[#1C1917] mt-0.5 truncate">{o.customerName}</span>
                        <span className="block text-[11px] text-[#78716C] truncate">{o.items.map((i) => i.product.name).join(', ')} · {o.paymentMethod}</span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-mono text-xs font-bold text-[#1C1917]">{formatRupiah(o.totalAmount)}</span>
                        <span className={`block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase text-center ${o.paymentStatus === 'PAID' ? 'bg-[#D1FAE5] text-[#065F46]' : 'bg-[#FEF3C7] text-[#92400E]'}`}>{o.status}</span>
                      </div>
                    </div>
                  ))}
                  {orders.length === 0 && <p className="text-xs text-[#78716C] py-6 text-center">Belum ada pesanan</p>}
                </div>
              </div>
            </motion.div>
          )}

          {active === 'pesanan' && (
            <motion.div key="pesanan" initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }} transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }} className="space-y-6">
              <div className="p-5 bg-white border border-[#E5E2DC] rounded-2xl shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-extrabold text-[#1C1917]">Pesanan</h3>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 bg-[#F3F1ED] rounded-full text-[#57534E]">{orders.length} Pesanan</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input value={orderSearch} onChange={(e) => setOrderSearch(e.target.value)} placeholder="Cari nomor / pelanggan…" className="flex-1 h-10 px-3.5 bg-[#FAF9F6] border border-[#D6D3D1] rounded-xl text-xs text-[#1C1917] focus:border-[#D97706] focus:outline-none" />
                  <select value={orderStatus} onChange={(e) => setOrderStatus(e.target.value)} className="h-10 px-3 bg-[#FAF9F6] border border-[#D6D3D1] rounded-xl text-xs font-semibold text-[#1C1917]">
                    <option value="ALL">Semua Status</option>
                    {['PENDING', 'AWAITING_PAYMENT', 'PAID', 'PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="p-5 bg-white border border-[#E5E2DC] rounded-2xl shadow-xs">
                {filteredOrders.length === 0 ? (
                  <p className="text-xs text-[#78716C] py-10 text-center border border-dashed border-[#E5E2DC] rounded-xl">Tidak ada pesanan sesuai filter.</p>
                ) : (
                  <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
                    {filteredOrders.map((o) => (
                      <div key={o.id} className="p-4 bg-[#FAF9F6] border border-[#E5E2DC] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-extrabold text-[#D97706]">{o.orderNumber}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${o.paymentStatus === 'PAID' ? 'bg-[#D1FAE5] text-[#065F46] border-[#A7F3D0]' : 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]'}`}>{o.paymentStatus}</span>
                          </div>
                          <span className="block text-sm font-bold text-[#1C1917] mt-1">{o.customerName}</span>
                          <span className="block text-xs text-[#78716C] truncate">{o.items.map((i) => i.product.name).join(', ')}</span>
                          <span className="block text-[11px] text-[#A8A29E] mt-1">{o.paymentMethod} · {new Date(o.createdAt).toLocaleString('id-ID')}</span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="block text-sm font-extrabold font-mono text-[#1C1917]">{formatRupiah(o.totalAmount)}</span>
                          <span className="inline-block mt-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-white border border-[#E5E2DC] text-[#57534E]">{o.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {active === 'inventaris' && (
            <motion.div key="inventaris" initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }} transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-6 bg-white border border-[#E5E2DC] rounded-2xl shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-extrabold text-[#1C1917]">Produk</h3>
                      <p className="text-xs text-[#78716C]">{products.length} varian · {products.reduce((s, p) => s + p.stock, 0)} pcs</p>
                    </div>
                    <Link href="/dashboard/admin" className="text-xs font-bold text-[#D97706] hover:underline">Kelola →</Link>
                  </div>
                  <input value={invSearch} onChange={(e) => setInvSearch(e.target.value)} placeholder="Cari produk…" className="w-full h-10 px-3.5 bg-[#FAF9F6] border border-[#D6D3D1] rounded-xl text-xs text-[#1C1917] focus:border-[#D97706] focus:outline-none" />
                  <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                    {filteredInv.slice(0, 20).map((p) => (
                      <div key={p.id} className="flex items-center justify-between p-3 bg-[#FAF9F6] border border-[#E5E2DC] rounded-xl">
                        <div className="min-w-0">
                          <span className="block text-xs font-bold text-[#1C1917] truncate">{p.name}</span>
                          <span className="block text-[11px] text-[#78716C]">{p.category} · {formatRupiah(p.price)} · terjual {p.soldCount}</span>
                        </div>
                        <span className={`text-xs font-bold font-mono px-2.5 py-1 rounded-full border ${p.stock < 15 ? 'bg-red-50 text-[#DC2626] border-red-200' : 'bg-[#D1FAE5] text-[#065F46] border-[#A7F3D0]'}`}>{p.stock} pcs</span>
                      </div>
                    ))}
                    {filteredInv.length === 0 && <p className="text-xs text-[#78716C] py-6 text-center">Tidak ada produk</p>}
                  </div>
                </div>
                <div className="p-6 bg-white border border-[#E5E2DC] rounded-2xl shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-extrabold text-[#1C1917]">Bahan Baku</h3>
                      <p className="text-xs text-[#78716C]">{formatRupiah(metrics.totalRawStockValue)}</p>
                    </div>
                    <Link href="/dashboard/supplier" className="text-xs font-bold text-[#059669] hover:underline">Kelola →</Link>
                  </div>
                  <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                    {rawMaterials.map((m) => (
                      <div key={m.id} className="flex items-center justify-between p-3 bg-[#FAF9F6] border border-[#E5E2DC] rounded-xl">
                        <div>
                          <span className="block text-xs font-bold text-[#1C1917]">{m.name}</span>
                          <span className="block text-[11px] text-[#78716C]">{formatRupiah(m.unitCost)} / {m.unit}</span>
                        </div>
                        <span className={`text-xs font-bold font-mono px-2.5 py-1 rounded-full border ${m.stock < 20 ? 'bg-red-50 text-[#DC2626] border-red-200' : 'bg-[#D1FAE5] text-[#065F46] border-[#A7F3D0]'}`}>{m.stock} {m.unit}</span>
                      </div>
                    ))}
                    {rawMaterials.length === 0 && <p className="text-xs text-[#78716C] py-6 text-center">Belum ada bahan baku</p>}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {active === 'keuangan' && (
            <motion.div key="keuangan" initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }} transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }} className="space-y-6">
              <section className="space-y-3">
                <h2 className="text-sm font-extrabold tracking-tight text-[#1C1917]">Ringkasan Finansial</h2>
                <Dashboard orders={orders as any} expenses={expenses as any} products={products as any} customerCount={metrics.customerCount} hideQuickActions />
              </section>
              <div className="flex justify-end">
                <Link href="/dashboard/finance" className="px-4 py-2 bg-white border border-[#E5E2DC] rounded-xl text-xs font-bold text-[#1C1917] hover:bg-[#FAF9F6]">Ke Finance →</Link>
              </div>
            </motion.div>
          )}

          {active === 'kinerja' && (
            <motion.div key="kinerja" initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }} transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-6 bg-white border border-[#E5E2DC] rounded-2xl shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-extrabold text-[#1C1917]">Omzet 7 Hari</h3>
                    <span className="text-xs font-bold text-[#059669] bg-[#D1FAE5] px-2.5 py-0.5 rounded-full">Lunas</span>
                  </div>
                  <div className="pt-4 flex items-end gap-2.5 h-[130px]">
                    {dayBuckets.map((b) => (
                      <div key={b.label} className="flex-1 flex flex-col items-center gap-2">
                        <div className="w-full rounded-md bg-[#D97706] hover:bg-[#B45309] transition-all" style={{ height: `${Math.max(8, (b.total / maxDay) * 100)}px`, opacity: b.total > 0 ? 1 : 0.2 }} title={`${b.label}: ${formatRupiah(b.total)}`} />
                        <span className="text-[11px] font-bold text-[#78716C]">{b.label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-2 border-t border-[#E5E2DC] flex justify-between text-xs text-[#78716C]">
                    <span>Tertunda: {formatRupiah(metrics.pendingRevenue)}</span>
                    <span className="font-bold text-[#1C1917]">Total: {formatRupiah(metrics.totalRevenue)}</span>
                  </div>
                </div>
                <div className="p-6 bg-white border border-[#E5E2DC] rounded-2xl shadow-xs space-y-3">
                  <h3 className="text-sm font-extrabold text-[#1C1917]">Kanal Pembayaran</h3>
                  <div className="pt-2 space-y-3">
                    {Object.entries(revenueByMethod).length === 0 ? (
                      <p className="text-xs text-[#78716C] py-8 text-center border border-dashed border-[#E5E2DC] rounded-xl">Belum ada transaksi lunas</p>
                    ) : (
                      Object.entries(revenueByMethod).map(([m, v]) => (
                        <div key={m} className="space-y-1">
                          <div className="flex justify-between text-xs font-medium">
                            <span className="text-[#1C1917] font-semibold">{m.replace('VA_', 'VA ')}</span>
                            <span className="font-mono font-bold text-[#D97706]">{formatRupiah(v)}</span>
                          </div>
                          <div className="h-2 bg-[#F3F1ED] border border-[#E5E2DC] rounded-full overflow-hidden">
                            <div className="h-full bg-[#D97706] rounded-full" style={{ width: `${(v / maxRev) * 100}%` }} />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {active === 'tim' && (
            <motion.div key="tim" initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }} transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}>
              <OwnerAdminsClient users={users} />
            </motion.div>
          )}

          {active === 'penggajian' && (
            <motion.div key="penggajian" initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }} transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}>
              <PayrollManager staffUsers={users.filter(u => ['ADMIN', 'STAFF', 'SUPPLIER', 'FINANCE'].includes(u.role)).map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role, baseSalary: u.baseSalary ?? null, phone: u.phone ?? null }))} payrolls={payrolls as any} />
            </motion.div>
          )}

          {active === 'aktivitas' && (
            <motion.div key="aktivitas" initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }} transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}>
              <ActivityFeed logs={logs} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
