'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { addProduct, updateStock, deleteProduct } from '@/lib/actions'
import { formatRupiah } from '@/lib/utils'
import { getProductImageUrl } from '@/lib/productImage'
import type { Product } from '@/lib/types'

type OrderRow = {
  id: number
  orderNumber: string
  customerName: string
  totalAmount: number
  status: string
  createdAt: Date
  items: { product: { name: string } }[]
}

const CATS = ['Tahu Goreng', 'Paket Besek', 'Tahu Mercon', 'Frozen', 'Pelengkap', 'Hampers']

export function AdminClient({
  products,
  orders,
}: {
  products: Product[]
  orders: OrderRow[]
}) {
  const [pending, start] = useTransition()
  const [msg, setMsg] = useState<{ text: string; err?: boolean } | null>(null)

  const notify = (text: string, err?: boolean) => {
    setMsg({ text, err })
    setTimeout(() => setMsg(null), 4000)
  }

  const onAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    start(async () => {
      const res = await addProduct(new FormData(form))
      notify(res.message, !res.success)
      if (res.success) form.reset()
    })
  }

  const totalStock = products.reduce((s, p) => s + p.stock, 0)
  const avgPrice = products.length ? products.reduce((s, p) => s + p.price, 0) / products.length : 0

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)]">
      <div className="max-w-[1260px] mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Admin Panel</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Kelola produk, stok, dan pesanan
            </p>
          </div>
          <Link
            href="/"
            className="px-5 py-2.5 bg-[var(--accent)] text-black text-sm font-semibold rounded-sm hover:brightness-110 transition"
          >
            ← Lihat Toko
          </Link>
        </div>

        {msg && (
          <div
            className={`p-3 rounded-sm border text-sm ${
              msg.err
                ? 'bg-red-500/10 border-red-500/20 text-red-400'
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            }`}
          >
            {msg.text}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[
            { label: 'Produk', value: String(products.length), sub: 'varian aktif' },
            { label: 'Stok total', value: `${totalStock}`, sub: 'pcs' },
            { label: 'Rata-rata harga', value: formatRupiah(Math.round(avgPrice)), sub: null },
            { label: 'Pesanan', value: String(orders.length), sub: 'terakhir' },
          ].map((s) => (
            <div key={s.label} className="p-5 bg-[var(--bg-raised)] border border-[var(--border)] rounded-sm">
              <span className="block text-[10px] text-[var(--text-tertiary)] tracking-[0.15em] uppercase">
                {s.label}
              </span>
              <span className="block text-xl font-bold font-[family-name:var(--font-mono)] mt-2">
                {s.value}
              </span>
              {s.sub && (
                <span className="block text-[11px] text-[var(--text-tertiary)] mt-1">{s.sub}</span>
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Add form */}
          <div className="lg:col-span-4">
            <div className="p-6 bg-[var(--bg-raised)] border border-[var(--border)] rounded-sm space-y-5 sticky top-6">
              <div>
                <h2 className="text-sm font-bold tracking-tight">Tambah Produk</h2>
                <p className="text-[11px] text-[var(--text-tertiary)] mt-1">
                  Produk baru langsung tampil di katalog
                </p>
              </div>

              <form onSubmit={onAdd} className="space-y-3">
                <input
                  name="name"
                  required
                  placeholder="Nama produk *"
                  className="w-full px-4 py-3 bg-[var(--bg)] border border-[var(--border)] rounded-sm text-sm placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent-dim)] focus:outline-none transition"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    name="price"
                    type="number"
                    required
                    min={0}
                    placeholder="Harga *"
                    className="w-full px-4 py-3 bg-[var(--bg)] border border-[var(--border)] rounded-sm text-sm font-[family-name:var(--font-mono)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent-dim)] focus:outline-none transition"
                  />
                  <input
                    name="stock"
                    type="number"
                    required
                    min={0}
                    placeholder="Stok *"
                    className="w-full px-4 py-3 bg-[var(--bg)] border border-[var(--border)] rounded-sm text-sm font-[family-name:var(--font-mono)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent-dim)] focus:outline-none transition"
                  />
                </div>
                <select
                  name="category"
                  defaultValue="Tahu Goreng"
                  className="w-full px-4 py-3 bg-[var(--bg)] border border-[var(--border)] rounded-sm text-sm text-[var(--text-secondary)] focus:border-[var(--accent-dim)] focus:outline-none transition"
                >
                  {CATS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <textarea
                  name="description"
                  rows={3}
                  placeholder="Deskripsi..."
                  className="w-full px-4 py-3 bg-[var(--bg)] border border-[var(--border)] rounded-sm text-sm placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent-dim)] focus:outline-none transition resize-none"
                />
                <input
                  name="image"
                  type="url"
                  placeholder="URL foto"
                  className="w-full px-4 py-3 bg-[var(--bg)] border border-[var(--border)] rounded-sm text-sm placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent-dim)] focus:outline-none transition"
                />
                <button
                  type="submit"
                  disabled={pending}
                  className="w-full py-3 bg-[var(--accent)] text-black text-sm font-semibold rounded-sm hover:brightness-110 transition disabled:opacity-40"
                >
                  {pending ? 'Menyimpan...' : 'Tambah Produk'}
                </button>
              </form>
            </div>
          </div>

          {/* List */}
          <div className="lg:col-span-8 space-y-6">
            {/* Products */}
            <div className="p-6 bg-[var(--bg-raised)] border border-[var(--border)] rounded-sm space-y-4">
              <h3 className="text-sm font-bold">Inventaris ({products.length})</h3>
              {products.length === 0 ? (
                <p className="text-sm text-[var(--text-tertiary)] py-8 text-center">Belum ada produk</p>
              ) : (
                <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
                  {products.map((p) => (
                    <div
                      key={p.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-[var(--bg)] border border-[var(--border)] rounded-sm"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-sm bg-[var(--bg-raised)] border border-[var(--border)] overflow-hidden shrink-0">
                          {(() => { const s = getProductImageUrl(p); return s ? <img src={s} alt={p.name} className="w-full h-full object-cover" /> : <span className="w-full h-full flex items-center justify-center text-[var(--text-tertiary)]">◇</span> })()}
                        </div>
                        <div className="min-w-0">
                          <span className="block text-sm font-semibold truncate">{p.name}</span>
                          <span className="block text-[11px] text-[var(--text-tertiary)] truncate">
                            {p.category} · {formatRupiah(p.price)} · Stok {p.stock}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center border border-[var(--border)] rounded-sm overflow-hidden">
                          <button
                            disabled={pending}
                            onClick={() =>
                              start(async () => {
                                await updateStock(p.id, p.stock - 5)
                              })
                            }
                            className="px-2.5 py-1.5 text-xs hover:bg-[var(--bg-raised)] transition disabled:opacity-40"
                          >
                            −5
                          </button>
                          <span className="px-3 py-1.5 text-xs font-[family-name:var(--font-mono)] border-x border-[var(--border)]">
                            {p.stock}
                          </span>
                          <button
                            disabled={pending}
                            onClick={() =>
                              start(async () => {
                                await updateStock(p.id, p.stock + 5)
                              })
                            }
                            className="px-2.5 py-1.5 text-xs hover:bg-[var(--bg-raised)] transition"
                          >
                            +5
                          </button>
                        </div>
                        <button
                          disabled={pending}
                          onClick={() => {
                            if (!confirm(`Hapus "${p.name}"?`)) return
                            start(async () => {
                              const r = await deleteProduct(p.id)
                              notify(r.message, !r.success)
                            })
                          }}
                          className="p-2 rounded-sm border border-red-500/20 text-red-400 hover:bg-red-500/10 transition text-xs disabled:opacity-40"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Orders */}
            <div className="p-6 bg-[var(--bg-raised)] border border-[var(--border)] rounded-sm space-y-4">
              <h3 className="text-sm font-bold">Pesanan Terbaru</h3>
              {orders.length === 0 ? (
                <p className="text-sm text-[var(--text-tertiary)] py-8 text-center">Belum ada pesanan</p>
              ) : (
                <div className="space-y-3">
                  {orders.map((o) => (
                    <div
                      key={o.id}
                      className="p-4 bg-[var(--bg)] border border-[var(--border)] rounded-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="text-xs font-[family-name:var(--font-mono)] text-[var(--accent)]">
                            {o.orderNumber}
                          </span>
                          <span className="block text-sm font-medium mt-1">{o.customerName}</span>
                          <span className="block text-[11px] text-[var(--text-tertiary)] mt-0.5">
                            {o.items.map((i) => i.product.name).join(', ')}
                          </span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="block text-xs font-[family-name:var(--font-mono)] font-semibold">
                            {formatRupiah(o.totalAmount)}
                          </span>
                          <span
                            className={`inline-block mt-1 px-2 py-0.5 rounded-sm text-[10px] font-semibold tracking-wider uppercase ${
                              o.status === 'PENDING'
                                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                                : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                            }`}
                          >
                            {o.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
