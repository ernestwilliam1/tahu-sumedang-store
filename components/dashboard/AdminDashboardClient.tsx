'use client'

import { useState, useTransition, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { addProduct, updateStock, deleteProduct, approvePayment, rejectPayment } from '@/lib/actions'
import { formatRupiah } from '@/lib/utils'
import { getProductImageUrl } from '@/lib/productImage'
import { ActivityFeed } from './ActivityFeed'
import { StockAlerts } from './StockAlerts'
import type { Product } from '@/lib/types'

type OrderRow = {
  id: number
  orderNumber: string
  customerName: string
  totalAmount: number
  status: string
  paymentMethod: string
  paymentStatus: string
  paymentProofUrl?: string | null
  vaNumber: string | null
  createdAt: Date
  items: { product: { name: string } }[]
}

type CustomerRow = {
  id: number
  name: string
  email: string
  phone: string | null
  city: string | null
  createdAt: Date
}

const CATS = ['Tahu Goreng', 'Paket Besek', 'Tahu Mercon', 'Frozen', 'Pelengkap', 'Hampers']
const ORDER_STATUSES = ['PENDING', 'AWAITING_PAYMENT', 'PAID', 'PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const
function statusLabel(s: string) {
  const map: Record<string, string> = {
    PENDING: 'Menunggu Pembayaran',
    AWAITING_PAYMENT: 'Menunggu Pembayaran',
    PAID: 'Lunas',
    PROCESSING: 'Diproses Dapur',
    PACKED: 'Dikemas',
    SHIPPED: 'Dikirim',
    DELIVERED: 'Selesai',
    CANCELLED: 'Dibatalkan',
  }
  return map[s] ?? s
}
function statusTone(s: string, pay: string) {
  if (pay === 'PAID' || s === 'PAID' || s === 'PROCESSING' || s === 'PACKED' || s === 'SHIPPED' || s === 'DELIVERED') return 'bg-[#D1FAE5] text-[#065F46] border-[#A7F3D0]'
  if (s === 'CANCELLED') return 'bg-red-50 text-[#991B1B] border-red-200'
  return 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]'
}

type NavTab = 'overview' | 'products' | 'orders' | 'customers' | 'aktivitas'
type LogLite = { id: string; role: string; action: string; message: string; createdAt: Date }

export function AdminDashboardClient({
  products,
  orders,
  role,
  customers,
  logs,
}: {
  products: Product[]
  orders: OrderRow[]
  role: string
  customers: CustomerRow[]
  logs: LogLite[]
}) {
  const [activeTab, setActiveTab] = useState<NavTab>('overview')
  const [pending, start] = useTransition()
  const [msg, setMsg] = useState<{ text: string; err?: boolean } | null>(null)

  // Filters & searches
  const [productSearch, setProductSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [orderSearch, setOrderSearch] = useState('')
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL')
  const [customerSearch, setCustomerSearch] = useState('')
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [previewProof, setPreviewProof] = useState<{ url: string; orderNumber: string } | null>(null)

  const notify = (t: string, e?: boolean) => {
    setMsg({ text: t, err: e })
    setTimeout(() => setMsg(null), 4000)
  }

  const onAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = e.currentTarget
    start(async () => {
      const r = await addProduct(new FormData(f))
      notify(r.message, !r.success)
      if (r.success) {
        f.reset()
        setShowAddProduct(false)
      }
    })
  }

  // Derived metrics
  const totalStock = useMemo(() => products.reduce((s, p) => s + p.stock, 0), [products])
  const avgPrice = useMemo(
    () => (products.length ? products.reduce((s, p) => s + p.price, 0) / products.length : 0),
    [products]
  )
  const pendingOrders = useMemo(
    () => orders.filter((o) => o.status === 'AWAITING_PAYMENT' || o.paymentStatus === 'PENDING'),
    [orders]
  )
  const processingOrders = useMemo(
    () => orders.filter((o) => o.status === 'PROCESSING' || o.paymentStatus === 'PAID'),
    [orders]
  )
  const lowStockProducts = useMemo(() => products.filter((p) => p.stock < 15), [products])

  // Filtered lists
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(productSearch.toLowerCase())
      const matchCat = selectedCategory === 'ALL' || p.category === selectedCategory
      return matchSearch && matchCat
    })
  }, [products, productSearch, selectedCategory])

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchSearch =
        o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.customerName.toLowerCase().includes(orderSearch.toLowerCase())
      const matchStatus = orderStatusFilter === 'ALL' || o.status === orderStatusFilter
      return matchSearch && matchStatus
    })
  }, [orders, orderSearch, orderStatusFilter])

  const filteredCustomers = useMemo(() => {
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
        c.email.toLowerCase().includes(customerSearch.toLowerCase()) ||
        (c.city && c.city.toLowerCase().includes(customerSearch.toLowerCase()))
    )
  }, [customers, customerSearch])

  return (
    <div className="space-y-6">
      {/* Toast Notification Banner */}
      {msg && (
        <div
          className={`p-4 rounded-xl border text-xs sm:text-sm font-semibold shadow-xs animate-slide-up ${
            msg.err
              ? 'bg-red-50 border-red-200 text-[#991B1B]'
              : 'bg-[#D1FAE5] border-[#A7F3D0] text-[#065F46]'
          }`}
        >
          {msg.text}
        </div>
      )}

      {/* Modular Layout: Dedicated Sub-Navigation Sidebar + Content Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Sub-Navigation Sidebar — 10/10 */}
        <aside className="lg:col-span-3 bg-white border border-[#EDE9E3] rounded-[18px] p-3 sm:p-4 shadow-[0_2px_8px_rgba(28,25,23,0.04),0_8px_24px_rgba(28,25,23,0.04)] sticky top-6">
          <div className="px-3 py-2 border-b border-[#F0EDE8] mb-2 hidden lg:block">
            <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-[#78716C]">
              Menu
            </span>
          </div>

          <nav className="flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0">
            {/* Tab: Overview */}
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all text-left shrink-0 lg:shrink lg:w-full ${
                activeTab === 'overview'
                  ? 'bg-[#1C1917] text-white shadow-sm'
                  : 'text-[#57534E] hover:bg-[#F3F1ED] hover:text-[#1C1917]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                </svg>
                <span>Ringkasan</span>
              </div>
            </button>

            {/* Tab: Products */}
            <button
              onClick={() => setActiveTab('products')}
              className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all text-left shrink-0 lg:shrink lg:w-full ${
                activeTab === 'products'
                  ? 'bg-[#1C1917] text-white shadow-sm'
                  : 'text-[#57534E] hover:bg-[#F3F1ED] hover:text-[#1C1917]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                </svg>
                <span>Katalog & Stok</span>
              </div>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-mono ${
                  activeTab === 'products' ? 'bg-white/20 text-white' : 'bg-[#F3F1ED] text-[#57534E]'
                }`}
              >
                {products.length}
              </span>
            </button>

            {/* Tab: Orders */}
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all text-left shrink-0 lg:shrink lg:w-full ${
                activeTab === 'orders'
                  ? 'bg-[#1C1917] text-white shadow-sm'
                  : 'text-[#57534E] hover:bg-[#F3F1ED] hover:text-[#1C1917]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                </svg>
                <span>Pesanan Toko</span>
              </div>
              {pendingOrders.length > 0 ? (
                <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-[#FEF3C7] text-[#92400E]">
                  {pendingOrders.length} baru
                </span>
              ) : (
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-mono ${
                    activeTab === 'orders' ? 'bg-white/20 text-white' : 'bg-[#F3F1ED] text-[#57534E]'
                  }`}
                >
                  {orders.length}
                </span>
              )}
            </button>

            {/* Tab: Customers (cleanly placed next to customer view) */}
            <button
              onClick={() => setActiveTab('customers')}
              className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all text-left shrink-0 lg:shrink lg:w-full ${
                activeTab === 'customers'
                  ? 'bg-[#1C1917] text-white shadow-sm'
                  : 'text-[#57534E] hover:bg-[#F3F1ED] hover:text-[#1C1917]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
                <span>Data Pelanggan</span>
              </div>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-mono ${
                  activeTab === 'customers' ? 'bg-white/20 text-white' : 'bg-[#F3F1ED] text-[#57534E]'
                }`}
              >
                {customers.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('aktivitas')}
              className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all text-left shrink-0 lg:shrink lg:w-full ${
                activeTab === 'aktivitas'
                  ? 'bg-[#1C1917] text-white shadow-sm'
                  : 'text-[#57534E] hover:bg-[#F3F1ED] hover:text-[#1C1917]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Aktivitas</span>
              </div>
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-mono ${activeTab === 'aktivitas' ? 'bg-white/20 text-white' : 'bg-[#F3F1ED] text-[#57534E]'}`}>{logs.length}</span>
            </button>
          </nav>
        </aside>

        {/* Right Main Content Pane */}
        <div className="lg:col-span-9 min-w-0">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-6"
              >
              {/* Metric Cards Grid — premium */}
              <StockAlerts threshold={15} />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 bg-white border border-[#EDE9E3] rounded-[16px] shadow-[0_2px_8px_rgba(28,25,23,0.04)] relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: '#1C1917' }} />
                  <span className="block text-[10px] font-bold tracking-[0.12em] uppercase text-[#78716C]">
                    Produk
                  </span>
                  <span className="block text-2xl font-extrabold font-[family-name:var(--font-mono)] text-[#1C1917] mt-2">
                    {products.length}
                  </span>
                </div>

                <div className="p-5 bg-white border border-[#EDE9E3] rounded-[16px] shadow-[0_2px_8px_rgba(28,25,23,0.04)] relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: 'linear-gradient(90deg,#D97706,#EA8A1A)' }} />
                  <span className="block text-[10px] font-bold tracking-[0.12em] uppercase text-[#78716C]">
                    Stok
                  </span>
                  <span className="block text-2xl font-extrabold font-[family-name:var(--font-mono)] text-[#D97706] mt-2">
                    {totalStock} pcs
                  </span>
                </div>

                <div className="p-5 bg-white border border-[#EDE9E3] rounded-[16px] shadow-[0_2px_8px_rgba(28,25,23,0.04)] relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: '#F59E0B' }} />
                  <span className="block text-[10px] font-bold tracking-[0.12em] uppercase text-[#78716C]">
                    Pesanan Tertunda
                  </span>
                  <span className="block text-2xl font-extrabold font-[family-name:var(--font-mono)] text-[#9A3412] mt-2">
                    {pendingOrders.length}
                  </span>
                </div>

                <div className="p-5 bg-white border border-[#EDE9E3] rounded-[16px] shadow-[0_2px_8px_rgba(28,25,23,0.04)] relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: '#059669' }} />
                  <span className="block text-[10px] font-bold tracking-[0.12em] uppercase text-[#78716C]">
                    Pelanggan
                  </span>
                  <span className="block text-2xl font-extrabold font-[family-name:var(--font-mono)] text-[#059669] mt-2">
                    {customers.length}
                  </span>
                </div>
              </div>

              {/* Quick Alerts */}
              {lowStockProducts.length > 0 && (
                <div className="p-4 bg-[#FEF3C7]/80 border border-[#FDE68A] rounded-2xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-[#FEF3C7] border border-[#FDE68A] flex items-center justify-center text-sm font-bold text-[#92400E]">
                      ⚠️
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-[#92400E]">
                        Stok menipis ({lowStockProducts.length})
                      </h4>
                      <p className="text-[11px] text-[#92400E]/80">
                        {lowStockProducts.map((p) => `${p.name} (${p.stock})`).join(', ')}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('products')}
                    className="px-3 py-1.5 bg-[#D97706] text-white text-xs font-bold rounded-lg shrink-0 shadow-xs hover:bg-[#B45309]"
                  >
                    Kelola
                  </button>
                </div>
              )}

              {/* Recent Orders Snapshot */}
              <div className="p-6 bg-white border border-[#E5E2DC] rounded-2xl shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[#1C1917]">Pesanan Terbaru</h3>
                  </div>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-bold text-[#D97706] hover:underline"
                  >
                    Lihat Semua →
                  </button>
                </div>

                <div className="divide-y divide-[#E5E2DC]">
                  {orders.slice(0, 5).map((o) => (
                    <div key={o.id} className="py-3 flex items-center justify-between gap-3">
                      <div>
                        <span className="font-mono text-xs font-bold text-[#D97706]">{o.orderNumber}</span>
                        <span className="block text-xs font-bold text-[#1C1917] mt-0.5">{o.customerName}</span>
                        <span className="block text-[11px] text-[#78716C]">
                          {o.items.map((i) => i.product.name).join(', ')} · {o.paymentMethod}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-xs font-bold text-[#1C1917]">
                          {formatRupiah(o.totalAmount)}
                        </span>
                        <span
                          className={`block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            o.paymentStatus === 'PAID'
                              ? 'bg-[#D1FAE5] text-[#065F46]'
                              : 'bg-[#FEF3C7] text-[#92400E]'
                          }`}
                        >
                          {o.status}
                        </span>
                      </div>
                    </div>
                  ))}
                  {orders.length === 0 && (
                    <p className="text-xs text-[#78716C] py-4 text-center">Belum ada pesanan</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'products' && (
            <motion.div
              key="products"
              initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-6"
            >
              {/* Product Header Actions */}
              <div className="p-5 bg-white border border-[#E5E2DC] rounded-2xl shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-extrabold text-[#1C1917]">Katalog & Stok</h3>
                  </div>
                  <button
                    onClick={() => setShowAddProduct((v) => !v)}
                    className="px-4 py-2 bg-[#D97706] hover:bg-[#B45309] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition active:scale-95"
                  >
                    <span>{showAddProduct ? 'Tutup Formulir' : '+ Tambah Produk Baru'}</span>
                  </button>
                </div>

                {/* Add Product Collapsible Panel */}
                {showAddProduct && (
                  <form onSubmit={onAdd} className="p-5 bg-[#FAF9F6] border border-[#E5E2DC] rounded-xl space-y-3.5 animate-slide-up">
                    <h4 className="text-xs font-bold text-[#1C1917] tracking-wider uppercase">
                      Tambah Produk
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-[#1C1917] mb-1">Nama Produk *</label>
                        <input
                          name="name"
                          required
                          placeholder="mis. Tahu Sumedang Crispy Besek"
                          className="w-full h-10 px-3.5 bg-white border border-[#D6D3D1] rounded-lg text-xs text-[#1C1917] focus:border-[#D97706] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#1C1917] mb-1">Kategori</label>
                        <select
                          name="category"
                          defaultValue="Tahu Goreng"
                          className="w-full h-10 px-3.5 bg-white border border-[#D6D3D1] rounded-lg text-xs text-[#1C1917] focus:border-[#D97706] focus:outline-none"
                        >
                          {CATS.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-[#1C1917] mb-1">Harga Satuan (Rp) *</label>
                        <input
                          name="price"
                          type="number"
                          required
                          min={0}
                          placeholder="25000"
                          className="w-full h-10 px-3.5 bg-white border border-[#D6D3D1] rounded-lg text-xs font-mono text-[#1C1917] focus:border-[#D97706] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#1C1917] mb-1">Stok Awal (pcs) *</label>
                        <input
                          name="stock"
                          type="number"
                          required
                          min={0}
                          placeholder="50"
                          className="w-full h-10 px-3.5 bg-white border border-[#D6D3D1] rounded-lg text-xs font-mono text-[#1C1917] focus:border-[#D97706] focus:outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#1C1917] mb-1">Deskripsi Produk</label>
                      <textarea
                        name="description"
                        rows={2}
                        placeholder="Keterangan rasa, porsi, isi buah..."
                        className="w-full p-3 bg-white border border-[#D6D3D1] rounded-lg text-xs text-[#1C1917] focus:border-[#D97706] focus:outline-none resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#1C1917] mb-1">URL Foto (opsional)</label>
                      <input
                        name="image"
                        type="url"
                        placeholder="https://..."
                        className="w-full h-10 px-3.5 bg-white border border-[#D6D3D1] rounded-lg text-xs text-[#1C1917] focus:border-[#D97706] focus:outline-none"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowAddProduct(false)}
                        className="px-4 py-2 border border-[#E5E2DC] text-xs font-bold rounded-lg bg-white text-[#57534E]"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={pending}
                        className="px-5 py-2 bg-[#D97706] hover:bg-[#B45309] text-white text-xs font-bold rounded-lg shadow-xs disabled:opacity-40"
                      >
                        {pending ? 'Menyimpan...' : 'Simpan Produk'}
                      </button>
                    </div>
                  </form>
                )}

                {/* Filter and Search */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Cari nama produk..."
                    className="flex-1 h-10 px-3.5 bg-[#FAF9F6] border border-[#D6D3D1] rounded-xl text-xs text-[#1C1917] focus:border-[#D97706] focus:outline-none"
                  />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="h-10 px-3 bg-[#FAF9F6] border border-[#D6D3D1] rounded-xl text-xs font-semibold text-[#1C1917] focus:border-[#D97706] focus:outline-none"
                  >
                    <option value="ALL">Semua Kategori</option>
                    {CATS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Products Inventory List */}
              <div className="p-5 bg-white border border-[#E5E2DC] rounded-2xl shadow-xs space-y-3">
                <div className="flex items-center justify-between text-xs text-[#78716C] px-1">
                  <span>Produk ({filteredProducts.length})</span>
                  <span>Stok</span>
                </div>

                {filteredProducts.length === 0 ? (
                  <p className="text-xs text-[#78716C] py-12 text-center border border-dashed border-[#E5E2DC] rounded-xl">
                    Tidak ada produk
                  </p>
                ) : (
                  <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
                    {filteredProducts.map((p) => (
                      <div
                        key={p.id}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 bg-[#FAF9F6] border border-[#E5E2DC] rounded-xl hover:border-[#D6D3D1] transition"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-12 h-12 rounded-lg bg-white border border-[#E5E2DC] overflow-hidden shrink-0">
                            {(() => {
                              const s = getProductImageUrl(p)
                              return s ? (
                                <img src={s} alt={p.name} className="w-full h-full object-cover" />
                              ) : (
                                <span className="w-full h-full flex items-center justify-center text-[#A8A29E]">◇</span>
                              )
                            })()}
                          </div>
                          <div className="min-w-0">
                            <span className="block text-xs sm:text-sm font-bold text-[#1C1917] truncate">
                              {p.name}
                            </span>
                            <span className="block text-[11px] text-[#78716C] truncate">
                              {p.category} · <strong className="text-[#D97706] font-mono">{formatRupiah(p.price)}</strong> · Terjual {p.soldCount}
                            </span>
                          </div>
                        </div>

                        {/* Stock Controls */}
                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                          <div className="flex items-center h-8 border border-[#D6D3D1] rounded-lg overflow-hidden bg-white shadow-2xs">
                            <button
                              disabled={pending}
                              onClick={() =>
                                start(async () => {
                                  await updateStock(p.id, Math.max(0, p.stock - 5))
                                })
                              }
                              className="px-2.5 text-xs font-bold text-[#57534E] hover:bg-[#F3F1ED] transition disabled:opacity-40"
                              title="Kurangi stok 5"
                            >
                              −5
                            </button>
                            <span
                              className={`px-3 text-xs font-bold font-mono border-x border-[#D6D3D1] h-full flex items-center ${
                                p.stock < 15 ? 'text-[#DC2626] bg-red-50' : 'text-[#1C1917]'
                              }`}
                            >
                              {p.stock}
                            </span>
                            <button
                              disabled={pending}
                              onClick={() =>
                                start(async () => {
                                  await updateStock(p.id, p.stock + 5)
                                })
                              }
                              className="px-2.5 text-xs font-bold text-[#57534E] hover:bg-[#F3F1ED] transition disabled:opacity-40"
                              title="Tambah stok 5"
                            >
                              +5
                            </button>
                          </div>

                          <button
                            disabled={pending}
                            onClick={() => {
                              if (!confirm(`Hapus produk "${p.name}"?`)) return
                              start(async () => {
                                const r = await deleteProduct(p.id)
                                notify(r.message, !r.success)
                              })
                            }}
                            className="h-8 px-3 rounded-lg border border-red-200 text-[#DC2626] text-xs font-bold hover:bg-red-50 transition"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'orders' && (
            <motion.div
              key="orders"
              initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-6"
            >
              <div className="p-5 bg-white border border-[#E5E2DC] rounded-2xl shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-extrabold text-[#1C1917]">Pesanan</h3>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 bg-[#F3F1ED] rounded-full text-[#57534E]">
                    {orders.length} pesanan
                  </span>
                </div>

                {/* Search & Status Filters */}
                <div className="flex flex-col sm:flex-row gap-3 pt-1">
                  <input
                    type="text"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder="Cari no. faktur / nama pelanggan..."
                    className="flex-1 h-10 px-3.5 bg-[#FAF9F6] border border-[#D6D3D1] rounded-xl text-xs text-[#1C1917] focus:border-[#D97706] focus:outline-none"
                  />
                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="h-10 px-3 bg-[#FAF9F6] border border-[#D6D3D1] rounded-xl text-xs font-semibold text-[#1C1917] focus:border-[#D97706] focus:outline-none"
                  >
                    <option value="ALL">Semua Status</option>
                    {ORDER_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {statusLabel(s)} ({s})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Order Cards / Table */}
              <div className="p-5 bg-white border border-[#E5E2DC] rounded-2xl shadow-xs space-y-3">
                {filteredOrders.length === 0 ? (
                  <p className="text-xs text-[#78716C] py-12 text-center border border-dashed border-[#E5E2DC] rounded-xl">
                    Tidak ada pesanan
                  </p>
                ) : (
                  <div className="space-y-3">
                    {filteredOrders.map((o) => (
                      <div
                        key={o.id}
                        className="p-4 bg-[#FAF9F6] border border-[#E5E2DC] rounded-xl hover:border-[#D6D3D1] transition"
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-extrabold text-[#D97706]">
                                {o.orderNumber}
                              </span>
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
                            </div>

                            <span className="block text-sm font-bold text-[#1C1917] mt-1">
                              {o.customerName}
                            </span>
                            <span className="block text-xs text-[#78716C] mt-0.5 truncate">
                              Item: {o.items.map((i) => i.product.name).join(', ')}
                            </span>
                            <span className="block text-[11px] text-[#A8A29E] mt-0.5">
                              Metode: {o.paymentMethod} {o.vaNumber ? `(VA: ${o.vaNumber})` : ''} ·{' '}
                              {new Date(o.createdAt).toLocaleString('id-ID')}
                            </span>

                            {o.paymentProofUrl && (
                              <div className="mt-2 flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setPreviewProof({ url: o.paymentProofUrl!, orderNumber: o.orderNumber })}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#D6D3D1] hover:border-[#D97706] text-[11px] font-bold text-[#1C1917] rounded-lg shadow-2xs transition"
                                >
                                  <svg className="w-3.5 h-3.5 text-[#D97706]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                  Lihat Bukti Transfer
                                </button>
                                {o.paymentStatus === 'WAITING_VERIFICATION' && (
                                  <span className="text-[10px] text-[#D97706] font-semibold">
                                    ● Butuh persetujuan
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="text-right shrink-0 space-y-2">
                            <span className="block text-sm font-extrabold font-mono text-[#1C1917]">
                              {formatRupiah(o.totalAmount)}
                            </span>
                            <div className="flex flex-wrap items-center justify-end gap-1.5">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${statusTone(o.status, o.paymentStatus)}`}>{statusLabel(o.status)}</span>
                              <span className="text-[10px] text-[#78716C]">· {o.status}</span>
                            </div>

                            {o.paymentStatus === 'WAITING_VERIFICATION' ? (
                              <div className="flex items-center justify-end gap-1.5 pt-1">
                                <button
                                  disabled={pending}
                                  onClick={() => {
                                    start(async () => {
                                      const res = await approvePayment(o.orderNumber)
                                      notify(res.message, !res.success)
                                    })
                                  }}
                                  className="px-3 py-1.5 bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold rounded-lg shadow-2xs transition active:scale-95 disabled:opacity-40"
                                >
                                  Verifikasi Lunas
                                </button>
                                <button
                                  disabled={pending}
                                  onClick={() => {
                                    const reason = prompt('Masukkan alasan penolakan (opsional):')
                                    start(async () => {
                                      const res = await rejectPayment(o.orderNumber, reason || undefined)
                                      notify(res.message, !res.success)
                                    })
                                  }}
                                  className="px-2.5 py-1.5 bg-white border border-red-200 text-[#DC2626] hover:bg-red-50 text-xs font-bold rounded-lg transition active:scale-95 disabled:opacity-40"
                                >
                                  Tolak
                                </button>
                              </div>
                            ) : (
                              <p className="text-[10px] leading-tight text-[#A8A29E] max-w-[220px] ml-auto">Status otomatis.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'customers' && (
            <motion.div
              key="customers"
              initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-6"
            >
              <div className="p-5 bg-white border border-[#E5E2DC] rounded-2xl shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-extrabold text-[#1C1917]">Pelanggan</h3>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 bg-[#D1FAE5] text-[#065F46] rounded-full">
                    {customers.length} Pelanggan
                  </span>
                </div>

                {/* Customer Search */}
                <input
                  type="text"
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  placeholder="Cari berdasarkan nama, email, atau kota..."
                  className="w-full h-10 px-3.5 bg-[#FAF9F6] border border-[#D6D3D1] rounded-xl text-xs text-[#1C1917] focus:border-[#D97706] focus:outline-none"
                />
              </div>

              {/* Customer Directory Table */}
              <div className="p-5 bg-white border border-[#E5E2DC] rounded-2xl shadow-xs">
                {filteredCustomers.length === 0 ? (
                  <p className="text-xs text-[#78716C] py-12 text-center border border-dashed border-[#E5E2DC] rounded-xl">
                    Belum ada pelanggan
                  </p>
                ) : (
                  <div className="border border-[#E5E2DC] rounded-xl overflow-hidden divide-y divide-[#E5E2DC]">
                    <div className="hidden sm:grid grid-cols-[1.2fr_1.4fr_1fr_120px] gap-2 px-4 py-3 bg-[#F3F1ED] text-[10px] font-bold tracking-wider uppercase text-[#78716C]">
                      <span>Nama Pelanggan</span>
                      <span>Email Akun</span>
                      <span>Kota / Domisili</span>
                      <span className="text-right">Bergabung</span>
                    </div>
                    {filteredCustomers.map((c) => (
                      <div
                        key={c.id}
                        className="grid grid-cols-1 sm:grid-cols-[1.2fr_1.4fr_1fr_120px] gap-1.5 sm:gap-2 px-4 py-3.5 text-xs bg-white hover:bg-[#FAF9F6] transition items-center"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-full bg-[#FEF3C7] text-[#92400E] font-bold flex items-center justify-center text-[10px] shrink-0">
                            {c.name.slice(0, 2).toUpperCase()}
                          </span>
                          <span className="font-bold text-[#1C1917] truncate">{c.name}</span>
                        </div>
                        <span className="text-[#57534E] truncate font-medium">{c.email}</span>
                        <span className="text-[#78716C] truncate">{c.city || '—'}</span>
                        <span className="text-[#A8A29E] font-mono text-[11px] sm:text-right">
                          {new Date(c.createdAt).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'aktivitas' && (
            <motion.div key="aktivitas" initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }} transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}>
              <ActivityFeed logs={logs} />
            </motion.div>
          )}
          </AnimatePresence>
        </div>
      </div>

      {/* Modal Preview Bukti Transfer */}
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
                      notify(res.message, !res.success)
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
