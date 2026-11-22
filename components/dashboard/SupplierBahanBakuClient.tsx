'use client'

import { useState, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createRawMaterial, deleteRawMaterial, addStockEntry } from '@/lib/actions'
import { formatRupiah } from '@/lib/utils'
import { ActivityFeed } from './ActivityFeed'

type Material = {
  id: number
  name: string
  sku: string | null
  category: string
  unit: string
  stock: number
  unitCost: number
  description: string | null
  supplier?: { name: string } | null
}

type Entry = {
  id: number
  materialId: number
  quantity: number
  unitCost: number
  totalCost: number
  note: string | null
  date: Date
  material: { name: string; unit: string }
}

const RAW_CATEGORIES = ['Bahan Baku', 'Koagulan', 'Minyak & Bahan Goreng', 'Kemasan', 'Bumbu & Pelengkap', 'Lainnya']
const UNITS = ['kg', 'liter', 'pcs', 'karung', 'botol', 'pak']

type LogLite = { id: string; role: string; action: string; message: string; createdAt: Date }
type TabId = 'persediaan' | 'riwayat' | 'aktivitas'

export function SupplierBahanBakuClient({
  materials,
  entries,
  isOwner,
  logs,
}: {
  materials: Material[]
  entries: Entry[]
  isOwner: boolean
  logs: LogLite[]
}) {
  const [pending, start] = useTransition()
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [showMaterialForm, setShowMaterialForm] = useState(false)
  const [showStockForm, setShowStockForm] = useState(false)
  const [active, setActive] = useState<TabId>('persediaan')

  const lowStock = materials.filter((m) => m.stock < 20)

  const onCreateMaterial = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    setErr(null)
    setMsg(null)
    start(async () => {
      const r = await createRawMaterial(fd)
      if (!r.success) {
        setErr(r.message)
      } else {
        setMsg(r.message)
        setShowMaterialForm(false)
        ;(e.target as HTMLFormElement).reset()
        setTimeout(() => setMsg(null), 3000)
      }
    })
  }

  const onAddStock = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    setErr(null)
    setMsg(null)
    start(async () => {
      const r = await addStockEntry(fd)
      if (!r.success) {
        setErr(r.message)
      } else {
        setMsg(r.message)
        setShowStockForm(false)
        ;(e.target as HTMLFormElement).reset()
        setTimeout(() => setMsg(null), 3000)
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Header Actions — open tab + form */}
      <div className="flex flex-wrap gap-2.5">
        <button
          onClick={() => {
            setActive('persediaan')
            setShowMaterialForm((v) => !v)
            setShowStockForm(false)
          }}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl shadow-xs transition active:scale-95 ${showMaterialForm && active === 'persediaan' ? 'bg-[#B45309] text-white' : 'bg-[#D97706] hover:bg-[#B45309] text-white'}`}
        >
          {showMaterialForm && active === 'persediaan' ? 'Batal' : '+ Bahan Baru'}
        </button>
        <button
          onClick={() => {
            setActive('riwayat')
            setShowStockForm((v) => !v)
            setShowMaterialForm(false)
          }}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl shadow-xs transition active:scale-95 ${showStockForm && active === 'riwayat' ? 'bg-[#047857] text-white' : 'bg-[#059669] hover:bg-[#047857] text-white'}`}
        >
          {showStockForm && active === 'riwayat' ? 'Batal' : '+ Barang Masuk'}
        </button>
      </div>

      {msg && (
        <div className="p-4 bg-[#D1FAE5] border border-[#A7F3D0] rounded-xl text-xs font-semibold text-[#065F46] animate-slide-up">
          {msg}
        </div>
      )}
      {err && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-[#991B1B] animate-slide-up">
          {err}
        </div>
      )}

      {/* KPI Stats — shared across tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white border border-[#E5E2DC] rounded-2xl shadow-xs">
          <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-[#78716C]">
            Bahan
          </span>
          <span className="block text-2xl font-extrabold font-[family-name:var(--font-mono)] text-[#1C1917] mt-2">
            {materials.length}
          </span>
        </div>
        <div className="p-5 bg-white border border-[#E5E2DC] rounded-2xl shadow-xs">
          <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-[#78716C]">Stok Menipis</span>
          <span className="block text-2xl font-extrabold font-[family-name:var(--font-mono)] text-[#DC2626] mt-2">
            {lowStock.length}
          </span>
        </div>
        <div className="p-5 bg-white border border-[#E5E2DC] rounded-2xl shadow-xs">
          <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-[#78716C]">
            Riwayat
          </span>
          <span className="block text-2xl font-extrabold font-[family-name:var(--font-mono)] text-[#1C1917] mt-2">
            {entries.length}
          </span>
        </div>
        <div className="p-5 bg-white border border-[#E5E2DC] rounded-2xl shadow-xs">
          <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-[#78716C]">Nilai Stok</span>
          <span className="block text-lg font-extrabold font-[family-name:var(--font-mono)] text-[#059669] mt-2 break-all">
            {formatRupiah(materials.reduce((s, m) => s + Math.round(m.stock * m.unitCost), 0))}
          </span>
        </div>
      </div>

      {/* Tab bar — persediaan / riwayat / aktivitas with sliding pill */}
      <div className="relative bg-white border border-[#E5E2DC] rounded-2xl p-1.5 shadow-[0_2px_8px_rgba(28,25,23,0.04)] flex gap-1.5 overflow-x-auto">
        <button
          onClick={() => setActive('persediaan')}
          className={`relative flex-1 min-w-[140px] flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-xs sm:text-sm font-bold transition-colors z-10 ${active === 'persediaan' ? 'text-white' : 'text-[#57534E] hover:text-[#1C1917]'}`}
        >
          {active === 'persediaan' && (
            <motion.div layoutId="supplier-tab-pill" className="absolute inset-0 bg-[#1C1917] rounded-xl shadow-sm" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
          )}
          <span className="relative flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
            Persediaan
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${active === 'persediaan' ? 'bg-white/20 text-white' : 'bg-[#F3F1ED] text-[#78716C]'}`}>{materials.length}</span>
          </span>
        </button>
        <button
          onClick={() => setActive('riwayat')}
          className={`relative flex-1 min-w-[140px] flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-xs sm:text-sm font-bold transition-colors z-10 ${active === 'riwayat' ? 'text-white' : 'text-[#57534E] hover:text-[#1C1917]'}`}
        >
          {active === 'riwayat' && (
            <motion.div layoutId="supplier-tab-pill" className="absolute inset-0 bg-[#1C1917] rounded-xl shadow-sm" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
          )}
          <span className="relative flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Riwayat Pasokan
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${active === 'riwayat' ? 'bg-white/20 text-white' : 'bg-[#F3F1ED] text-[#78716C]'}`}>{entries.length}</span>
          </span>
        </button>
        <button
          onClick={() => setActive('aktivitas')}
          className={`relative flex-1 min-w-[120px] flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-xs sm:text-sm font-bold transition-colors z-10 ${active === 'aktivitas' ? 'text-white' : 'text-[#57534E] hover:text-[#1C1917]'}`}
        >
          {active === 'aktivitas' && (
            <motion.div layoutId="supplier-tab-pill" className="absolute inset-0 bg-[#1C1917] rounded-xl shadow-sm" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
          )}
          <span className="relative flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Aktivitas
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${active === 'aktivitas' ? 'bg-white/20 text-white' : 'bg-[#F3F1ED] text-[#78716C]'}`}>{logs.length}</span>
          </span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {active === 'persediaan' && (
          <motion.div
            key="persediaan"
            initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-4"
          >
          {showMaterialForm && (
            <form
              onSubmit={onCreateMaterial}
              className="p-6 bg-white border border-[#E5E2DC] rounded-2xl shadow-xs space-y-4 animate-slide-up"
            >
              <h3 className="text-sm font-extrabold text-[#1C1917]">Tambah Bahan</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  name="name"
                  required
                  placeholder="Nama bahan *"
                  className="px-3.5 py-2.5 bg-[#FAF9F6] border border-[#D6D3D1] rounded-xl text-xs text-[#1C1917] focus:border-[#D97706] focus:outline-none"
                />
                <input
                  name="sku"
                  placeholder="SKU"
                  className="px-3.5 py-2.5 bg-[#FAF9F6] border border-[#D6D3D1] rounded-xl text-xs text-[#1C1917] focus:border-[#D97706] focus:outline-none"
                />
                <select
                  name="category"
                  defaultValue="Bahan Baku"
                  className="px-3.5 py-2.5 bg-[#FAF9F6] border border-[#D6D3D1] rounded-xl text-xs font-semibold text-[#1C1917] focus:border-[#D97706] focus:outline-none"
                >
                  {RAW_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <select
                  name="unit"
                  defaultValue="kg"
                  className="px-3.5 py-2.5 bg-[#FAF9F6] border border-[#D6D3D1] rounded-xl text-xs font-semibold text-[#1C1917] focus:border-[#D97706] focus:outline-none"
                >
                  {UNITS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
                <input
                  name="unitCost"
                  type="number"
                  min={0}
                  placeholder="Harga satuan (Rp)"
                  className="px-3.5 py-2.5 bg-[#FAF9F6] border border-[#D6D3D1] rounded-xl text-xs font-mono text-[#1C1917]"
                />
                <input
                  name="stock"
                  type="number"
                  step="0.01"
                  min={0}
                  placeholder="Stok awal"
                  className="px-3.5 py-2.5 bg-[#FAF9F6] border border-[#D6D3D1] rounded-xl text-xs font-mono text-[#1C1917]"
                />
              </div>
              <input
                name="description"
                placeholder="Catatan"
                className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#D6D3D1] rounded-xl text-xs text-[#1C1917]"
              />
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowMaterialForm(false)}
                  className="px-4 py-2 border border-[#E5E2DC] text-xs font-bold rounded-xl bg-white text-[#57534E]"
                >
                  Batal
                </button>
                <button
                  disabled={pending}
                  type="submit"
                  className="px-5 py-2 bg-[#D97706] hover:bg-[#B45309] text-white text-xs font-bold rounded-xl shadow-xs disabled:opacity-40"
                >
                  {pending ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          )}

          <div className="p-6 bg-white border border-[#E5E2DC] rounded-2xl shadow-xs">
            <h3 className="text-sm font-extrabold text-[#1C1917] mb-4">
              Persediaan {isOwner && <span className="font-normal text-[#78716C]">· Semua</span>}
            </h3>
            {materials.length === 0 ? (
              <p className="text-xs text-[#78716C] py-8 text-center border border-dashed border-[#E5E2DC] rounded-xl">
                Belum ada bahan baku
              </p>
            ) : (
              <div className="space-y-2.5">
                {materials.map((m) => (
                  <div
                    key={m.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-[#FAF9F6] border border-[#E5E2DC] rounded-xl hover:border-[#D6D3D1] transition"
                  >
                    <div className="min-w-0">
                      <span className="block text-xs sm:text-sm font-bold text-[#1C1917] truncate">
                        {m.name} <span className="font-normal text-xs text-[#78716C]">· {m.category}</span>
                      </span>
                      <span className="block text-xs text-[#78716C] mt-0.5">
                        {m.unitCost ? formatRupiah(m.unitCost) + ` / ${m.unit}` : '—'} · Stok:{' '}
                        <strong className={m.stock < 20 ? 'text-[#DC2626] font-mono' : 'text-[#059669] font-mono'}>
                          {m.stock} {m.unit}
                        </strong>
                        {m.sku ? ` · SKU ${m.sku}` : ''}
                        {isOwner && m.supplier ? ` · ${m.supplier.name}` : ''}
                      </span>
                      {m.description && <span className="block text-[11px] text-[#57534E] mt-1">{m.description}</span>}
                    </div>

                    <button
                      disabled={pending}
                      onClick={() =>
                        start(async () => {
                          const r = await deleteRawMaterial(m.id)
                          if (!r.success) setErr(r.message)
                          else setMsg(r.message)
                        })
                      }
                      className="self-start sm:self-auto text-xs font-semibold px-3 py-1.5 border border-red-200 text-[#DC2626] rounded-lg hover:bg-red-50 disabled:opacity-40 transition"
                    >
                      Hapus
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          </motion.div>
        )}
        {active === 'riwayat' && (
          <motion.div
            key="riwayat"
            initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-4"
          >
            {showStockForm && (
              <form
                onSubmit={onAddStock}
                className="p-6 bg-[#D1FAE5]/30 border border-[#A7F3D0] rounded-2xl space-y-4 animate-slide-up"
              >
                <h3 className="text-sm font-extrabold text-[#065F46]">Barang Masuk</h3>
                <p className="text-xs text-[#57534E]">
                  Stok bertambah otomatis.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <select
                    name="materialId"
                    required
                    className="px-3.5 py-2.5 bg-white border border-[#D6D3D1] rounded-xl text-xs font-semibold text-[#1C1917]"
                  >
                    <option value="">Pilih bahan *</option>
                    {materials.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} — stok {m.stock} {m.unit}
                      </option>
                    ))}
                  </select>
                  <input
                    name="quantity"
                    type="number"
                    step="0.01"
                    required
                    placeholder="Jumlah *"
                    className="px-3.5 py-2.5 bg-white border border-[#D6D3D1] rounded-xl text-xs text-[#1C1917]"
                  />
                  <input
                    name="unitCost"
                    type="number"
                    required
                    placeholder="Harga satuan (Rp) *"
                    className="px-3.5 py-2.5 bg-white border border-[#D6D3D1] rounded-xl text-xs text-[#1C1917]"
                  />
                  <input
                    name="date"
                    type="date"
                    defaultValue={new Date().toISOString().slice(0, 10)}
                    className="px-3.5 py-2.5 bg-white border border-[#D6D3D1] rounded-xl text-xs text-[#1C1917]"
                  />
                </div>
                <input
                  name="note"
                  placeholder="Catatan"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#D6D3D1] rounded-xl text-xs text-[#1C1917]"
                />
                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowStockForm(false)}
                    className="px-4 py-2 border border-[#E5E2DC] text-xs font-bold rounded-xl bg-white text-[#57534E]"
                  >
                    Batal
                  </button>
                  <button
                    disabled={pending}
                    type="submit"
                    className="px-5 py-2 bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold rounded-xl shadow-xs disabled:opacity-40"
                  >
                    {pending ? 'Mencatat...' : 'Simpan'}
                  </button>
                </div>
              </form>
            )}

            <div className="p-6 bg-white border border-[#E5E2DC] rounded-2xl shadow-xs">
              <h3 className="text-sm font-extrabold text-[#1C1917] mb-3">Riwayat Pasokan</h3>
              {entries.length === 0 ? (
                <p className="text-xs text-[#78716C] py-8 text-center border border-dashed border-[#E5E2DC] rounded-xl">
                  Belum ada riwayat
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-[10px] tracking-wider uppercase text-[#78716C] border-b border-[#E5E2DC]">
                        <th className="text-left py-2.5 font-bold">Tanggal</th>
                        <th className="text-left py-2.5 font-bold">Bahan</th>
                        <th className="text-right py-2.5 font-bold">Jumlah</th>
                        <th className="text-right py-2.5 font-bold">Harga Beli</th>
                        <th className="text-right py-2.5 font-bold">Total Biaya</th>
                        <th className="text-left py-2.5 font-bold pl-4">Catatan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E2DC]">
                      {entries.slice(0, 30).map((e) => (
                        <tr key={e.id} className="hover:bg-[#FAF9F6]">
                          <td className="py-2.5 text-[#78716C] font-mono">{new Date(e.date).toLocaleDateString('id-ID')}</td>
                          <td className="py-2.5 font-semibold text-[#1C1917]">{e.material.name}</td>
                          <td className="py-2.5 text-right font-mono font-bold text-[#1C1917]">
                            {e.quantity} {e.material.unit}
                          </td>
                          <td className="py-2.5 text-right font-mono text-[#78716C]">{formatRupiah(e.unitCost)}</td>
                          <td className="py-2.5 text-right font-mono font-extrabold text-[#059669]">{formatRupiah(e.totalCost)}</td>
                          <td className="py-2.5 text-[#57534E] pl-4 max-w-[200px] truncate">{e.note ?? '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        )}
        {active === 'aktivitas' && (
          <motion.div key="aktivitas" initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }} transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}>
            <ActivityFeed logs={logs} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}


