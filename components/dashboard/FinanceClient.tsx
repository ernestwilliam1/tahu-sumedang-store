'use client'

import { useCallback, useEffect, useMemo, useState, useTransition, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatRupiah } from '@/lib/utils'
import { addExpense, deleteExpense, confirmOrderPayment, approvePayment, rejectPayment } from '@/lib/actions'
import { PayrollManager } from '@/components/dashboard/PayrollManager'
import { ActivityFeed } from '@/components/dashboard/ActivityFeed'

type OrderLite = {
  totalAmount: number
  paymentStatus: string
  status: string
  paymentMethod: string
  paymentProofUrl?: string | null
  createdAt: Date
  orderNumber: string
  vaNumber: string | null
  customerName?: string
}

type ExpenseLite = {
  id: number
  amount: number
  category: string
  description: string | null
  date: Date
}
type StaffLite = { id: number; name: string; email: string; role: string; baseSalary: number | null; phone: string | null }
type PayLite = { id: string; userId: number | null; employeeId: string | null; amount: number; month: string; status: string; paidAt: Date; createdAt: Date; user: StaffLite | null; employee: { name: string; position: string } | null }
type LogLite = { id: string; role: string; action: string; message: string; createdAt: Date }

const RANGES = [
  { id: 'today', label: 'Hari ini' },
  { id: '7d', label: '7 Hari' },
  { id: '30d', label: '1 Bulan' },
  { id: '90d', label: '3 Bulan' },
  { id: '365d', label: '1 Tahun' },
] as const

type RangeId = (typeof RANGES)[number]['id']
type ViewMode = 'combined' | 'income' | 'expense'
type TabId = 'ringkasan' | 'tren' | 'beban' | 'rekonsiliasi' | 'penggajian' | 'aktivitas'

function rangeStart(id: RangeId, baseDate: Date = new Date()): Date {
  const d = new Date(baseDate)
  d.setHours(0, 0, 0, 0)
  if (id === 'today') return d
  if (id === '7d') { d.setDate(d.getDate() - 6); return d }
  if (id === '30d') { d.setDate(d.getDate() - 29); return d }
  if (id === '90d') { d.setDate(d.getDate() - 89); return d }
  d.setDate(d.getDate() - 364); return d
}
function compactRp(n: number): string {
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}jt`
  if (n >= 1000) return `Rp ${(n / 1000).toFixed(0)}rb`
  return `Rp ${n}`
}
function niceMax(v: number): number {
  if (v <= 0) return 10000
  const pow = Math.pow(10, Math.floor(Math.log10(v)))
  const n = v / pow
  const nice = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10
  return nice * pow
}

function IconGrid() {
  return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>
}
function IconChart() {
  return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>
}
function IconWallet() {
  return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 9.75h10.5a2.25 2.25 0 002.25-2.25v-6.375a2.25 2.25 0 00-2.25-2.25H6a2.25 2.25 0 00-2.25 2.25v6.375A2.25 2.25 0 006 16.5h.75m11.25-11.25h.008v.008h-.008V5.25zm3 0h.008v.008h-.008V5.25z" /></svg>
}
function IconCheck() {
  return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
}
function IconUsers() {
  return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
}

export function FinanceClient({ orders, expenses, role, staffUsers, payrolls, logs }: { orders: OrderLite[]; expenses: ExpenseLite[]; role: string; staffUsers: StaffLite[]; payrolls: PayLite[]; logs: LogLite[] }) {
  const [range, setRange] = useState<RangeId>('30d')
  const [view, setView] = useState<ViewMode>('combined')
  const [active, setActive] = useState<TabId>('ringkasan')
  const [pending, start] = useTransition()
  const [msg, setMsg] = useState<string | null>(null)
  const [hover, setHover] = useState<number | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [showReconModal, setShowReconModal] = useState(false)
  const [previewProof, setPreviewProof] = useState<{ url: string; orderNumber: string } | null>(null)

  // Realtime clock: selalu mengikuti tanggal kalender saat ini secara otomatis
  const [currentDate, setCurrentDate] = useState(() => new Date())
  useEffect(() => {
    const timer = setInterval(() => setCurrentDate(new Date()), 30000)
    return () => clearInterval(timer)
  }, [])

  const filtered = useMemo(() => {
    const startDate = rangeStart(range, currentDate)
    const end = new Date(currentDate); end.setHours(23, 59, 59, 999)
    const inRange = (d: Date) => d >= startDate && d <= end
    const paidOrders = orders.filter((o) => o.paymentStatus === 'PAID' && inRange(new Date(o.createdAt)))
    const allOrdersInRange = orders.filter((o) => inRange(new Date(o.createdAt)))
    const expensesInRange = expenses.filter((e) => inRange(new Date(e.date)))
    const revenue = paidOrders.reduce((s, o) => s + o.totalAmount, 0)
    const totalExpenses = expensesInRange.reduce((s, e) => s + e.amount, 0)
    return { paidOrders, allOrdersInRange, expensesInRange, revenue, totalExpenses, profit: revenue - totalExpenses }
  }, [orders, expenses, range, currentDate])

  const buckets = useMemo(() => {
    const startDate = rangeStart(range, currentDate)
    const days = Math.ceil((currentDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)) + 1
    const weekly = days > 30
    const bucketCount = weekly ? Math.ceil(days / 7) : days
    const arr: { label: string; shortLabel: string; revenue: number; expense: number; profit: number }[] = []
    for (let i = bucketCount - 1; i >= 0; i--) {
      const end = new Date(currentDate); end.setHours(23, 59, 59, 999)
      if (weekly) end.setDate(end.getDate() - i * 7); else end.setDate(end.getDate() - i)
      const start = new Date(end)
      if (weekly) start.setDate(end.getDate() - 6); else start.setHours(0, 0, 0, 0)
      const rev = filtered.paidOrders.filter((o) => { const t = new Date(o.createdAt).getTime(); return t >= start.getTime() && t <= end.getTime() }).reduce((s, o) => s + o.totalAmount, 0)
      const exp = filtered.expensesInRange.filter((e) => { const t = new Date(e.date).getTime(); return t >= start.getTime() && t <= end.getTime() }).reduce((s, e) => s + e.amount, 0)
      const longLabel = weekly ? `${start.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })} – ${end.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}` : start.toLocaleDateString('id-ID', { weekday: 'short', day: '2-digit', month: 'short' })
      const shortLabel = weekly ? start.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) : start.toLocaleDateString('id-ID', { day: '2-digit' })
      arr.push({ label: longLabel, shortLabel, revenue: rev, expense: exp, profit: rev - exp })
    }
    return arr
  }, [filtered, range, currentDate])

  const maxVal = useMemo(() => {
    const raw = view === 'income' ? Math.max(...buckets.map((b) => b.revenue)) : view === 'expense' ? Math.max(...buckets.map((b) => b.expense)) : Math.max(...buckets.flatMap((b) => [b.revenue, b.expense]))
    return niceMax(raw || 0)
  }, [buckets, view])
  const yTicks = useMemo(() => [maxVal, Math.round(maxVal * 0.75), Math.round(maxVal * 0.5), Math.round(maxVal * 0.25), 0], [maxVal])

  const byMethod = useMemo(() => {
    const m: Record<string, number> = {}
    filtered.paidOrders.forEach((o) => { m[o.paymentMethod] = (m[o.paymentMethod] || 0) + o.totalAmount })
    return Object.entries(m).sort((a, b) => (b[1] as number) - (a[1] as number))
  }, [filtered])
  const expByCat = useMemo(() => {
    const m: Record<string, number> = {}
    filtered.expensesInRange.forEach((e) => { m[e.category] = (m[e.category] || 0) + e.amount })
    return Object.entries(m).sort((a, b) => (b[1] as number) - (a[1] as number))
  }, [filtered])

  const pendingRecon = useMemo(() => orders.filter((o) => o.paymentStatus !== 'PAID' && o.status !== 'DELIVERED' && o.status !== 'CANCELLED').slice(0, 30), [orders])

  const onAddExpense = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const f = e.currentTarget
    start(async () => {
      const r = await addExpense(fd)
      setMsg(r.message); setTimeout(() => setMsg(null), 3000)
      if (r.success) { f.reset(); setShowExpenseModal(false) }
    })
  }

  const handleExport = useCallback(() => {
    const header = ['Tanggal', 'Tipe', 'Keterangan', 'Kanal/Kategori', 'Nominal (Rp)', 'Status']
    const rows: string[][] = []
    filtered.paidOrders.forEach((o) => rows.push([new Date(o.createdAt).toLocaleDateString('id-ID'), 'Pendapatan', o.orderNumber + (o.customerName ? ' — ' + o.customerName : ''), o.paymentMethod, String(o.totalAmount), o.paymentStatus]))
    filtered.expensesInRange.forEach((ex) => rows.push([new Date(ex.date).toLocaleDateString('id-ID'), 'Beban Usaha', ex.description || ex.category, ex.category, String(ex.amount), 'Tercatat']))
    const csv = [header, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\r\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `laporan-keuangan-${range}-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url)
    setMsg(`Laporan periode ${RANGES.find((r) => r.id === range)?.label} berhasil diunduh (${rows.length} baris).`)
    setTimeout(() => setMsg(null), 3500)
  }, [filtered, range])

  useEffect(() => {
    const onExport = () => handleExport()
    const onRecon = () => setShowReconModal(true)
    const onExpense = () => setShowExpenseModal(true)
    window.addEventListener('finance:export', onExport)
    window.addEventListener('finance:reconcile', onRecon)
    window.addEventListener('finance:expense', onExpense)
    return () => {
      window.removeEventListener('finance:export', onExport)
      window.removeEventListener('finance:reconcile', onRecon)
      window.removeEventListener('finance:expense', onExpense)
    }
  }, [handleExport])

  const scroll = (d: 'left' | 'right') => scrollRef.current?.scrollBy({ left: d === 'left' ? -280 : 280, behavior: 'smooth' })
  const bucketMin = range === '365d' ? 40 : range === '90d' ? 44 : 52
  const chartMinWidth = buckets.length * bucketMin
  const dense = range === '365d' || range === '90d'

  const TABS: { id: TabId; label: string; desc: string; icon: React.ReactNode }[] = [
    { id: 'ringkasan', label: 'Ringkasan', desc: 'KPI', icon: <IconGrid /> },
    { id: 'tren', label: 'Arus Kas', desc: 'Tren', icon: <IconChart /> },
    { id: 'beban', label: 'Beban', desc: 'Pengeluaran', icon: <IconWallet /> },
    { id: 'rekonsiliasi', label: 'Rekonsiliasi', desc: `${pendingRecon.length} tertunda`, icon: <IconCheck /> },
    { id: 'penggajian', label: 'Penggajian', desc: `${staffUsers.length} karyawan`, icon: <IconUsers /> },
    { id: 'aktivitas', label: 'Aktivitas', desc: `${logs.length} log`, icon: <IconCheck /> },
  ] as { id: TabId; label: string; desc: string; icon: React.ReactNode }[]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Sidebar */}
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
        <div className="hidden lg:block mt-4 p-3 bg-[#FAF9F6] border border-[#E5E2DC] rounded-xl">
          <p className="text-[11px] font-bold text-[#1C1917]">Periode</p>
          <p className="text-xs text-[#78716C] mt-1">{RANGES.find((r) => r.id === range)?.label} · {filtered.paidOrders.length} pendapatan · {filtered.expensesInRange.length} beban</p>
        </div>
      </aside>

      {/* Content */}
      <div className="lg:col-span-9 space-y-6 min-w-0">
        {/* Kontrol Periode & Tampilan */}
        <div className="p-4 bg-white border border-[#E5E2DC] rounded-2xl shadow-[0_2px_8px_rgba(28,25,23,0.04)] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-[#78716C] mr-1">Periode</span>
            {RANGES.map((r) => (
              <button key={r.id} onClick={() => setRange(r.id)} className={`h-8 px-3.5 rounded-full text-xs font-bold border transition-all active:scale-95 ${range === r.id ? 'bg-[#D97706] text-white border-[#D97706] shadow-xs' : 'bg-[#FAF9F6] border-[#E5E2DC] text-[#57534E] hover:border-[#D6D3D1] hover:bg-white'}`}>{r.label}</button>
            ))}
          </div>
          <div className="flex items-center gap-0 p-1 bg-[#FAF9F6] border border-[#E5E2DC] rounded-full self-start lg:self-auto">
            {(['combined', 'income', 'expense'] as ViewMode[]).map((v) => (
              <button key={v} onClick={() => setView(v)} className={`px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide transition ${view === v ? 'bg-[#1C1917] text-white shadow-sm' : 'text-[#78716C] hover:text-[#1C1917]'}`}>{v === 'combined' ? 'Gabungan' : v === 'income' ? 'Pendapatan' : 'Beban'}</button>
            ))}
          </div>
        </div>

        {msg && <div className="p-3 bg-[#D1FAE5] border border-[#A7F3D0] rounded-xl text-xs font-semibold text-[#065F46] animate-slide-up">{msg}</div>}

        <AnimatePresence mode="wait">
          {active === 'ringkasan' && (
            <motion.div key="ringkasan" initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }} transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 bg-[#D1FAE5]/40 border border-[#A7F3D0] rounded-2xl shadow-xs overflow-hidden flex flex-col min-h-[112px]">
                  <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-[#065F46]">Pendapatan</span>
                  <span className="block text-lg sm:text-xl font-extrabold tabular-nums text-[#065F46] mt-2 leading-tight break-all">{formatRupiah(filtered.revenue)}</span>
                  <span className="block text-xs text-[#065F46]/80 mt-1">{filtered.paidOrders.length} transaksi</span>
                </div>
                <div className="p-5 bg-red-50/60 border border-red-200 rounded-2xl shadow-xs overflow-hidden flex flex-col min-h-[112px]">
                  <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-[#991B1B]">Beban</span>
                  <span className="block text-lg sm:text-xl font-extrabold tabular-nums text-[#DC2626] mt-2 leading-tight break-all">{formatRupiah(filtered.totalExpenses)}</span>
                  <span className="block text-xs text-[#991B1B]/80 mt-1">{filtered.expensesInRange.length} entri</span>
                </div>
                <div className={`p-5 rounded-2xl shadow-xs border overflow-hidden flex flex-col min-h-[112px] ${filtered.profit >= 0 ? 'bg-[#FEF3C7]/40 border-[#FDE68A]' : 'bg-red-50 border-red-200'}`}>
                  <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-[#78716C]">{filtered.profit >= 0 ? 'Laba Bersih' : 'Rugi Bersih'}</span>
                  <span className={`block text-lg sm:text-xl font-extrabold tabular-nums mt-2 leading-tight break-all ${filtered.profit >= 0 ? 'text-[#059669]' : 'text-[#DC2626]'}`}>{formatRupiah(filtered.profit)}</span>
                  <span className="block text-xs text-[#78716C] mt-1">Margin {filtered.revenue ? ((filtered.profit / filtered.revenue) * 100).toFixed(1) : '0'}%</span>
                </div>
                <div className="p-5 bg-white border border-[#E5E2DC] rounded-2xl shadow-xs overflow-hidden flex flex-col min-h-[112px]">
                  <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-[#78716C]">Transaksi</span>
                  <span className="block text-2xl font-extrabold tabular-nums text-[#1C1917] mt-2 leading-tight">{filtered.allOrdersInRange.length}</span>
                  <span className="block text-xs text-[#78716C] mt-1">{filtered.paidOrders.length} lunas · {filtered.allOrdersInRange.length - filtered.paidOrders.length} tertunda</span>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="p-5 bg-white border border-[#E5E2DC] rounded-2xl shadow-xs space-y-3 overflow-hidden">
                  <h3 className="text-xs font-extrabold text-[#1C1917] tracking-wider uppercase">Pendapatan per Kanal</h3>
                  <div className="space-y-2.5">
                    {byMethod.length === 0 ? <p className="text-xs text-[#78716C] py-4 text-center">Belum ada pendapatan</p> : byMethod.map(([m, v]) => {
                      const max = Math.max(...byMethod.map(([, val]) => val as number)); const pct = ((v as number) / max) * 100
                      return <div key={m} className="space-y-1"><div className="flex justify-between gap-2 text-xs min-w-0"><span className="font-semibold text-[#1C1917] truncate">{m.replace('VA_', 'VA ')}</span><span className="tabular-nums font-bold text-[#059669] shrink-0 break-all text-right">{formatRupiah(v as number)}</span></div><div className="h-2 bg-[#F3F1ED] rounded-full overflow-hidden"><div className="h-full bg-[#059669] rounded-full" style={{ width: `${pct}%` }} /></div></div>
                    })}
                  </div>
                </div>
                <div className="p-5 bg-white border border-[#E5E2DC] rounded-2xl shadow-xs space-y-3 overflow-hidden">
                  <h3 className="text-xs font-extrabold text-[#1C1917] tracking-wider uppercase">Beban per Kategori</h3>
                  <div className="space-y-2.5">
                    {expByCat.length === 0 ? <p className="text-xs text-[#78716C] py-4 text-center">Belum ada beban</p> : expByCat.map(([c, v]) => {
                      const max = Math.max(...expByCat.map(([, val]) => val as number)); const pct = ((v as number) / max) * 100
                      return <div key={c} className="space-y-1"><div className="flex justify-between gap-2 text-xs min-w-0"><span className="font-semibold text-[#1C1917] truncate">{c}</span><span className="tabular-nums font-bold text-[#DC2626] shrink-0 break-all text-right">{formatRupiah(v as number)}</span></div><div className="h-2 bg-[#F3F1ED] rounded-full overflow-hidden"><div className="h-full bg-[#DC2626] rounded-full" style={{ width: `${pct}%` }} /></div></div>
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {active === 'tren' && (
            <motion.div key="tren" initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }} transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }} className="space-y-6">
              <div className="p-6 bg-white border border-[#E5E2DC] rounded-2xl shadow-xs overflow-hidden">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
                  <div>
                    <h3 className="text-sm font-extrabold text-[#1C1917]">Arus Kas</h3>
                    <p className="text-xs text-[#78716C] mt-0.5">{RANGES.find((r) => r.id === range)?.label} · Skala {compactRp(maxVal)}</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-bold">
                    <span className="flex items-center gap-1.5 text-[#065F46]"><span className="w-3 h-2.5 rounded-sm bg-[#059669]" /> Pendapatan</span>
                    <span className="flex items-center gap-1.5 text-[#991B1B]"><span className="w-3 h-2.5 rounded-sm bg-[#DC2626]" /> Beban</span>
                  </div>
                </div>
                <div className="flex gap-0">
                  <div className="hidden sm:flex flex-col justify-between h-[180px] pr-3 shrink-0 w-[72px] text-right">
                    {yTicks.map((v) => <span key={v} className="text-[10px] font-mono font-medium text-[#78716C] leading-none">{compactRp(v)}</span>)}
                  </div>
                  <div className="flex-1 min-w-0 relative">
                    <div className="absolute inset-0 flex flex-col justify-between h-[180px] pointer-events-none">
                      {yTicks.map((_, i) => <div key={i} className={`w-full h-px ${i === yTicks.length - 1 ? 'bg-[#D6D3D1]' : 'bg-[#E5E2DC]/80'}`} />)}
                    </div>
                    <div ref={scrollRef} className="overflow-x-auto scroll-smooth relative" style={{ scrollbarWidth: 'thin' }}>
                      <div className="flex items-end gap-1.5 h-[180px] pb-1" style={{ minWidth: dense ? chartMinWidth : undefined }}>
                        {buckets.map((b, idx) => {
                          const revH = maxVal ? Math.max(4, (b.revenue / maxVal) * 145) : 4
                          const expH = maxVal ? Math.max(4, (b.expense / maxVal) * 145) : 4
                          const isHover = hover === idx
                          return (
                            <div key={idx} onMouseEnter={() => setHover(idx)} onMouseLeave={() => setHover(null)} className="flex-1 flex flex-col items-center gap-1.5 min-w-0 relative" style={{ minWidth: bucketMin - 6 }}>
                              {isHover && (
                                <div className="absolute bottom-[150px] left-1/2 -translate-x-1/2 z-20 pointer-events-none w-max max-w-[220px] p-3 bg-white border border-[#E5E2DC] rounded-xl shadow-xl text-left animate-fade-in">
                                  <p className="text-xs font-bold text-[#1C1917]">{b.label}</p>
                                  <div className="mt-1.5 space-y-1 text-xs font-mono">
                                    <div className="flex justify-between gap-4"><span className="text-[#065F46]">Pendapatan:</span><span className="font-bold text-[#065F46]">{formatRupiah(b.revenue)}</span></div>
                                    <div className="flex justify-between gap-4"><span className="text-[#DC2626]">Beban:</span><span className="font-bold text-[#DC2626]">{formatRupiah(b.expense)}</span></div>
                                    <div className="flex justify-between gap-4 pt-1 border-t border-[#E5E2DC]"><span className="text-[#78716C]">Laba:</span><span className={`font-bold ${b.profit >= 0 ? 'text-[#065F46]' : 'text-[#DC2626]'}`}>{formatRupiah(b.profit)}</span></div>
                                  </div>
                                </div>
                              )}
                              <div className="w-full flex gap-1 items-end justify-center" style={{ height: 148 }}>
                                {(view === 'combined' || view === 'income') && <div className="flex-1 rounded-t-md transition-all" style={{ height: revH, maxWidth: view === 'combined' ? 18 : 26, background: b.revenue ? '#059669' : '#E5E2DC' }} />}
                                {(view === 'combined' || view === 'expense') && <div className="flex-1 rounded-t-md transition-all" style={{ height: expH, maxWidth: view === 'combined' ? 18 : 26, background: b.expense ? '#DC2626' : '#E5E2DC' }} />}
                              </div>
                              <span className={`text-[9px] font-bold truncate w-full text-center leading-none ${isHover ? 'text-[#1C1917]' : 'text-[#78716C]'}`}>{dense ? b.shortLabel : b.label}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                    {dense && <>
                      <button onClick={() => scroll('left')} aria-label="Scroll kiri" className="absolute left-1 top-[75px] -translate-y-1/2 w-7 h-7 rounded-full bg-white border border-[#E5E2DC] flex items-center justify-center text-xs shadow-md">‹</button>
                      <button onClick={() => scroll('right')} aria-label="Scroll kanan" className="absolute right-1 top-[75px] -translate-y-1/2 w-7 h-7 rounded-full bg-white border border-[#E5E2DC] flex items-center justify-center text-xs shadow-md">›</button>
                    </>}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {active === 'beban' && (
            <motion.div key="beban" initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }} transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-4">
                <form onSubmit={onAddExpense} className="p-6 bg-white border border-[#E5E2DC] rounded-2xl shadow-xs space-y-3.5 sticky top-6">
                  <div>
                    <h3 className="text-sm font-extrabold text-[#1C1917]">Tambah Beban</h3>
                  </div>
                  <div><label className="block text-xs font-bold text-[#1C1917] mb-1">Nominal (Rp) *</label><input name="amount" type="number" required min={1} placeholder="50000" className="w-full h-10 px-3.5 bg-[#FAF9F6] border border-[#D6D3D1] rounded-xl text-xs font-mono text-[#1C1917] focus:border-[#D97706] focus:outline-none" /></div>
                  <div><label className="block text-xs font-bold text-[#1C1917] mb-1">Kategori</label><select name="category" defaultValue="Operasional" className="w-full h-10 px-3.5 bg-[#FAF9F6] border border-[#D6D3D1] rounded-xl text-xs font-semibold text-[#1C1917] focus:border-[#D97706] focus:outline-none">{['Operasional', 'Bahan Baku', 'Gaji', 'Marketing', 'Sewa', 'Listrik', 'Lainnya'].map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
                  <div><label className="block text-xs font-bold text-[#1C1917] mb-1">Tanggal</label><input name="date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} className="w-full h-10 px-3.5 bg-[#FAF9F6] border border-[#D6D3D1] rounded-xl text-xs text-[#1C1917]" /></div>
                  <div><label className="block text-xs font-bold text-[#1C1917] mb-1">Keterangan</label><input name="description" placeholder="mis. Elpiji 3kg × 4 tabung" className="w-full h-10 px-3.5 bg-[#FAF9F6] border border-[#D6D3D1] rounded-xl text-xs text-[#1C1917] focus:border-[#D97706] focus:outline-none" /></div>
                  <button type="submit" disabled={pending} className="w-full h-11 bg-[#D97706] hover:bg-[#B45309] text-white text-xs font-bold rounded-xl shadow-xs transition active:scale-95 disabled:opacity-40">{pending ? 'Menyimpan…' : 'Simpan Beban'}</button>
                </form>
              </div>
              <div className="lg:col-span-8">
                <div className="p-6 bg-white border border-[#E5E2DC] rounded-2xl shadow-xs space-y-4">
                  <div className="flex items-center justify-between"><div><h3 className="text-sm font-extrabold text-[#1C1917]">Beban</h3><p className="text-xs text-[#78716C]">{filtered.expensesInRange.length} entri</p></div></div>
                  {filtered.expensesInRange.length === 0 ? <p className="text-xs text-[#78716C] py-10 text-center border border-dashed border-[#E5E2DC] rounded-xl">Belum ada data</p> : (
                    <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
                      {filtered.expensesInRange.slice(0, 80).map((e) => (
                        <div key={e.id} className="flex items-center justify-between gap-3 p-3.5 bg-[#FAF9F6] border border-[#E5E2DC] rounded-xl hover:border-[#D6D3D1] transition">
                          <div className="min-w-0"><span className="text-xs font-bold text-[#1C1917] block truncate">{e.category}</span><span className="block text-[11px] text-[#78716C] truncate">{e.description || '—'} · {new Date(e.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</span></div>
                          <div className="flex items-center gap-3 shrink-0"><span className="text-xs font-mono font-extrabold text-[#DC2626]">{formatRupiah(e.amount)}</span><button disabled={pending} onClick={() => { if (!confirm('Hapus pencatatan ini?')) return; start(async () => { const r = await deleteExpense(e.id); setMsg(r.message); setTimeout(() => setMsg(null), 3000) }) }} className="text-[11px] font-semibold text-[#DC2626] border border-red-200 px-2.5 py-1 rounded-lg hover:bg-red-50 transition">Hapus</button></div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {active === 'rekonsiliasi' && (
            <motion.div key="rekonsiliasi" initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }} transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }} className="space-y-4">
              <div className="p-6 bg-white border border-[#E5E2DC] rounded-2xl shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div><h3 className="text-sm font-extrabold text-[#1C1917]">Rekonsiliasi</h3><p className="text-xs text-[#78716C]">{pendingRecon.length} tertunda</p></div>
                  <span className="text-xs font-bold px-3 py-1 bg-[#FEF3C7] text-[#92400E] rounded-full">{pendingRecon.length} tertunda</span>
                </div>
                {pendingRecon.length === 0 ? <p className="text-xs text-[#78716C] py-10 text-center border border-dashed border-[#E5E2DC] rounded-xl">Semua terekonsiliasi ✓</p> : (
                  <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
                    {pendingRecon.map((o) => (
                      <div key={o.orderNumber} className="p-4 bg-[#FAF9F6] border border-[#E5E2DC] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-extrabold text-[#D97706]">{o.orderNumber}</span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                o.paymentStatus === 'PAID'
                                  ? 'bg-[#D1FAE5] text-[#065F46] border border-[#A7F3D0]'
                                  : o.paymentStatus === 'WAITING_VERIFICATION'
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300 font-extrabold animate-pulse'
                                  : o.paymentStatus === 'REJECTED'
                                  ? 'bg-red-50 text-red-700 border border-red-200'
                                  : 'bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]'
                              }`}
                            >
                              {o.paymentStatus === 'WAITING_VERIFICATION' ? 'VERIFIKASI BUKTI' : o.paymentStatus}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-white border border-[#E5E2DC] text-[#57534E]">{o.status}</span>
                          </div>
                          <span className="block text-xs text-[#78716C] mt-1 truncate">{o.paymentMethod}{o.vaNumber ? ` · VA ${o.vaNumber}` : ''} · {new Date(o.createdAt).toLocaleString('id-ID')}</span>
                          <span className="block text-xs font-bold text-[#1C1917] mt-1">{(o as any).customerName || '—'} · {formatRupiah(o.totalAmount)}</span>

                          {o.paymentProofUrl && (
                            <div className="mt-2">
                              <button
                                type="button"
                                onClick={() => setPreviewProof({ url: o.paymentProofUrl!, orderNumber: o.orderNumber })}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#D6D3D1] hover:border-[#D97706] text-[11px] font-bold text-[#1C1917] rounded-lg shadow-2xs transition"
                              >
                                <svg className="w-3.5 h-3.5 text-[#D97706]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                Periksa Bukti Bayar
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            disabled={pending}
                            onClick={() => start(async () => {
                              const r = await approvePayment(o.orderNumber)
                              setMsg(r.message)
                              setTimeout(() => setMsg(null), 3500)
                            })}
                            className="px-4 py-2 bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold rounded-xl shadow-xs transition active:scale-95 disabled:opacity-40"
                          >
                            Verifikasi Lunas
                          </button>
                          {o.paymentStatus === 'WAITING_VERIFICATION' && (
                            <button
                              disabled={pending}
                              onClick={() => {
                                const reason = prompt('Masukkan alasan penolakan (opsional):')
                                start(async () => {
                                  const r = await rejectPayment(o.orderNumber, reason || undefined)
                                  setMsg(r.message)
                                  setTimeout(() => setMsg(null), 3500)
                                })
                              }}
                              className="px-3 py-2 bg-white border border-red-200 text-[#DC2626] hover:bg-red-50 text-xs font-bold rounded-xl transition active:scale-95 disabled:opacity-40"
                            >
                              Tolak
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-[11px] text-[#A8A29E]">Verifikasi mengubah status menjadi <strong>PAID</strong> otomatis.</p>
              </div>
            </motion.div>
          )}

          {active === 'penggajian' && (
            <motion.div key="penggajian" initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }} transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}>
              <PayrollManager staffUsers={staffUsers} payrolls={payrolls as any} />
            </motion.div>
          )}

          {active === 'aktivitas' && (
            <motion.div key="aktivitas" initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }} transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}>
              <ActivityFeed logs={logs} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modal: Tambah Beban */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#1C1917]/30 backdrop-blur-sm" onClick={() => setShowExpenseModal(false)} />
          <form onSubmit={onAddExpense} className="relative w-full max-w-md p-6 bg-white border border-[#E5E2DC] rounded-2xl shadow-xl space-y-4 animate-slide-up">
            <div className="flex items-center justify-between"><h3 className="text-sm font-extrabold text-[#1C1917]">Tambah Beban</h3><button type="button" onClick={() => setShowExpenseModal(false)} className="w-7 h-7 rounded-full bg-[#FAF9F6] border border-[#E5E2DC] flex items-center justify-center text-xs">✕</button></div>
            <div><label className="block text-xs font-bold text-[#1C1917] mb-1">Nominal (Rp) *</label><input name="amount" type="number" required min={1} placeholder="75000" autoFocus className="w-full h-10 px-3.5 bg-[#FAF9F6] border border-[#D6D3D1] rounded-xl text-xs font-mono text-[#1C1917] focus:border-[#D97706] focus:outline-none" /></div>
            <div><label className="block text-xs font-bold text-[#1C1917] mb-1">Kategori</label><select name="category" defaultValue="Operasional" className="w-full h-10 px-3.5 bg-[#FAF9F6] border border-[#D6D3D1] rounded-xl text-xs font-semibold text-[#1C1917]">{['Operasional', 'Bahan Baku', 'Gaji', 'Marketing', 'Sewa', 'Listrik', 'Lainnya'].map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
            <div className="grid grid-cols-2 gap-3"><div><label className="block text-xs font-bold text-[#1C1917] mb-1">Tanggal</label><input name="date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} className="w-full h-10 px-3.5 bg-[#FAF9F6] border border-[#D6D3D1] rounded-xl text-xs text-[#1C1917]" /></div><div><label className="block text-xs font-bold text-[#1C1917] mb-1">Keterangan</label><input name="description" placeholder="Uraian singkat" className="w-full h-10 px-3.5 bg-[#FAF9F6] border border-[#D6D3D1] rounded-xl text-xs text-[#1C1917]" /></div></div>
            <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => setShowExpenseModal(false)} className="px-4 py-2 bg-white border border-[#E5E2DC] rounded-xl text-xs font-bold text-[#57534E]">Batal</button><button type="submit" disabled={pending} className="px-5 py-2 bg-[#1C1917] text-white rounded-xl text-xs font-bold hover:bg-[#292524] disabled:opacity-40">{pending ? 'Menyimpan…' : 'Simpan Beban'}</button></div>
          </form>
        </div>
      )}

      {/* Modal: Rekonsiliasi */}
      {showReconModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#1C1917]/30 backdrop-blur-sm" onClick={() => setShowReconModal(false)} />
          <div className="relative w-full max-w-lg max-h-[80vh] flex flex-col bg-white border border-[#E5E2DC] rounded-2xl shadow-xl overflow-hidden animate-slide-up">
            <div className="p-5 border-b border-[#E5E2DC] flex items-center justify-between shrink-0"><div><h3 className="text-sm font-extrabold text-[#1C1917]">Rekonsiliasi Pembayaran</h3><p className="text-xs text-[#78716C]">{pendingRecon.length} transaksi menunggu verifikasi</p></div><button onClick={() => setShowReconModal(false)} className="w-7 h-7 rounded-full bg-[#FAF9F6] border border-[#E5E2DC] flex items-center justify-center text-xs">✕</button></div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {pendingRecon.length === 0 ? <p className="text-xs text-[#78716C] py-12 text-center">Tidak ada tertunda ✓</p> : pendingRecon.slice(0, 12).map((o) => (
                <div key={o.orderNumber} className="p-3 bg-[#FAF9F6] border border-[#E5E2DC] rounded-xl flex items-center justify-between gap-3">
                  <div className="min-w-0"><span className="font-mono text-xs font-bold text-[#D97706]">{o.orderNumber}</span><span className="block text-xs text-[#78716C] truncate">{o.paymentMethod} · {formatRupiah(o.totalAmount)}</span></div>
                  <button disabled={pending} onClick={() => start(async () => { const r = await confirmOrderPayment(o.orderNumber); setMsg(r.message); setTimeout(() => setMsg(null), 3000) })} className="px-3 py-1.5 bg-[#059669] text-white text-xs font-bold rounded-lg shrink-0">Verifikasi</button>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-[#E5E2DC] flex justify-end shrink-0"><button onClick={() => { setShowReconModal(false); setActive('rekonsiliasi') }} className="text-xs font-bold text-[#D97706] hover:underline">Buka halaman rekonsiliasi lengkap →</button></div>
          </div>
        </div>
      )}

      {/* Modal: Preview Bukti Transfer */}
      {previewProof && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" style={{ isolation: 'isolate' }}>
          <div className="relative w-full max-w-lg bg-white border border-[#E5E2DC] rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E2DC]">
              <div>
                <h3 className="text-sm font-extrabold text-[#1C1917]">Bukti Transfer Pelanggan</h3>
                <p className="text-xs text-[#78716C] font-mono">{previewProof.orderNumber}</p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewProof(null)}
                className="w-7 h-7 rounded-full bg-[#FAF9F6] border border-[#E5E2DC] flex items-center justify-center text-xs text-[#78716C] hover:bg-white"
              >
                ✕
              </button>
            </div>

            <div className="relative max-h-[60vh] overflow-y-auto rounded-xl border border-[#E5E2DC] bg-[#FAF9F6] p-2 flex items-center justify-center">
              <img
                src={previewProof.url}
                alt="Bukti Transfer"
                className="max-w-full max-h-[55vh] object-contain rounded-lg"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <a
                href={previewProof.url}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-[#D97706] font-semibold hover:underline inline-flex items-center gap-1"
              >
                Buka tab baru ↗
              </a>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewProof(null)}
                  className="px-4 py-2 bg-[#FAF9F6] border border-[#E5E2DC] text-xs font-bold rounded-xl text-[#57534E] hover:bg-white"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => {
                    const ord = previewProof.orderNumber
                    setPreviewProof(null)
                    start(async () => {
                      const res = await approvePayment(ord)
                      setMsg(res.message)
                      setTimeout(() => setMsg(null), 3500)
                    })
                  }}
                  className="px-4 py-2 bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold rounded-xl shadow-xs transition active:scale-95 disabled:opacity-40"
                >
                  Verifikasi Lunas Sekarang
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
