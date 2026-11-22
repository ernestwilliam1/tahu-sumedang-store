'use client'

import { useState, useTransition, useRef } from 'react'
import Link from 'next/link'
import { formatRupiah } from '@/lib/utils'
import { updateProfileAction } from '@/lib/authActions'
import { uploadPaymentProof } from '@/lib/actions'

type OrderRow = {
  id: number
  orderNumber: string
  status: string
  paymentMethod: string
  paymentStatus: string
  paymentProofUrl?: string | null
  totalAmount: number
  vaNumber: string | null
  createdAt: Date
  items: { product: { name: string } }[]
}

export function ProfileClient({
  user,
  orders,
}: {
  user: {
    name: string
    email: string
    phone: string | null
    address: string | null
    city: string | null
    role: string
  }
  orders: OrderRow[]
}) {
  const [msg, setMsg] = useState<{ text: string; err?: boolean } | null>(null)
  const [pending, start] = useTransition()
  const [uploadingOrder, setUploadingOrder] = useState<string | null>(null)
  const [previewProofUrl, setPreviewProofUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const activeOrderRef = useRef<string | null>(null)

  const pendingOrders = orders.filter(
    (o) => o.status === 'AWAITING_PAYMENT' || o.paymentStatus === 'UNPAID' || o.paymentStatus === 'PENDING'
  )
  const doneOrders = orders.filter(
    (o) => o.status === 'DELIVERED' || o.paymentStatus === 'PAID'
  )

  const ORDER_STEPS = [
    { key: 'ORDERED', label: 'Pesanan Diterima', short: 'Diterima' },
    { key: 'PROCESSING', label: 'Penyiapan Menu', short: 'Penyiapan' },
    { key: 'PACKED', label: 'Pengemasan', short: 'Pengemasan' },
    { key: 'SHIPPED', label: 'Dalam Pengiriman', short: 'Pengiriman' },
    { key: 'DELIVERED', label: 'Pesanan Selesai', short: 'Selesai' },
  ] as const

  const STATUS_PROGRESS_MAP: Record<string, { stepIndex: number; title: string; desc: string }> = {
    AWAITING_PAYMENT: {
      stepIndex: 0,
      title: 'Menunggu Pembayaran',
      desc: 'Pesanan telah tercatat dalam sistem. Menunggu konfirmasi pembayaran dan bukti transfer.',
    },
    PENDING: {
      stepIndex: 0,
      title: 'Pesanan Diterima',
      desc: 'Pesanan telah masuk ke dalam antrean operasional dapur.',
    },
    PROCESSING: {
      stepIndex: 1,
      title: 'Penyiapan & Pemrosesan Menu',
      desc: 'Pesanan sedang disiapkan secara higienis menggunakan bahan berkualitas tinggi.',
    },
    PACKED: {
      stepIndex: 2,
      title: 'Pengemasan Pesanan',
      desc: 'Produk telah selesai diproses dan sedang dikemas rapi dengan standar mutu higienis.',
    },
    SHIPPED: {
      stepIndex: 3,
      title: 'Dalam Pengiriman Kurir',
      desc: 'Pesanan telah diserahkan kepada kurir dan sedang menuju lokasi pengantaran Anda.',
    },
    DELIVERED: {
      stepIndex: 4,
      title: 'Pesanan Telah Selesai',
      desc: 'Pesanan telah berhasil diterima di alamat tujuan. Terima kasih telah berbelanja.',
    },
    CANCELLED: {
      stepIndex: -1,
      title: 'Pesanan Dibatalkan',
      desc: 'Transaksi pesanan ini telah dibatalkan.',
    },
  }

  const printInvoice = (o: OrderRow) => {
    const w = window.open('', '_blank')
    if (!w) return
    w.document.write(`<html><head><title>Invoice ${o.orderNumber}</title><style>body{font-family:system-ui;padding:32px;color:#1C1917} h1{color:#D97706} table{width:100%;border-collapse:collapse;margin-top:16px} td,th{border:1px solid #E5E2DC;padding:8px;text-align:left;font-size:13px} .total{font-weight:800}</style></head><body><h1>Tahu Sumedang — Invoice</h1><p>Invoice: <b>${o.orderNumber}</b><br/>Tanggal: ${new Date(o.createdAt).toLocaleString('id-ID')}<br/>Metode: ${o.paymentMethod} · Status: ${o.paymentStatus}<br/>Pelanggan: ${user.name} · ${user.email}</p><table><tr><th>Produk</th><th>Total</th></tr><tr><td>${o.items.map(i => i.product.name).join(', ')}</td><td>${formatRupiah(o.totalAmount)}</td></tr><tr><td class="total">Total Bayar</td><td class="total">${formatRupiah(o.totalAmount)}</td></tr></table><p>Penerima: BCA 5020348994 a.n. ERNEST WILLIAM IMANUEL HU</p><script>window.print(); window.onafterprint=()=>window.close()</script></body></html>`)
    w.document.close()
  }

  const onSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    start(async () => {
      const r = await updateProfileAction(fd)
      setMsg({ text: r.message, err: !r.success })
      setTimeout(() => setMsg(null), 3500)
    })
  }

  const handleSelectProofFile = (orderNumber: string) => {
    activeOrderRef.current = orderNumber
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    const orderNumber = activeOrderRef.current
    if (!file || !orderNumber) return

    setUploadingOrder(orderNumber)
    start(async () => {
      const fd = new FormData()
      fd.append('orderNumber', orderNumber)
      fd.append('file', file)
      const res = await uploadPaymentProof(fd)
      setUploadingOrder(null)
      activeOrderRef.current = null
      e.target.value = ''
      setMsg({ text: res.message, err: !res.success })
      setTimeout(() => setMsg(null), 4000)
    })
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1C1917]">
      <div className="max-w-[var(--content-max)] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6">
        {/* Header Banner */}
        <div className="p-6 bg-white border border-[#E5E2DC] rounded-2xl shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">
                Portal Pelanggan
              </span>
              <span className="text-xs text-[#78716C]">Akun Konsumen Tahu Sumedang</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1C1917] tracking-tight">
              Profil & Riwayat Pesanan
            </h1>
            <p className="text-xs sm:text-sm font-medium text-[#57534E] mt-0.5">
              Kelola informasi kontak pengiriman dan pantau status pesanan tahu Anda
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="px-4 py-2 text-xs sm:text-sm font-bold text-[#1C1917] bg-[#FAF9F6] border border-[#E5E2DC] rounded-xl hover:bg-[#F3F1ED] transition shadow-xs"
            >
              ← Belanja Lagi
            </Link>
          </div>
        </div>

        {msg && (
          <div
            className={`p-4 rounded-xl border text-xs sm:text-sm font-semibold shadow-xs animate-slide-up ${msg.err
              ? 'bg-red-50 border-red-200 text-[#991B1B]'
              : 'bg-[#D1FAE5] border-[#A7F3D0] text-[#065F46]'
              }`}
          >
            {msg.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Profile Form (Strictly here in the user portal) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-6 bg-white border border-[#E5E2DC] rounded-2xl shadow-xs space-y-4">
              <div>
                <h2 className="text-base font-extrabold text-[#1C1917]">Data Diri Pelanggan</h2>
                <p className="text-xs text-[#78716C] mt-0.5">
                  Informasi ini digunakan otomatis saat checkout
                </p>
              </div>

              <form onSubmit={onSave} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#1C1917] mb-1">Nama Lengkap *</label>
                  <input
                    name="name"
                    defaultValue={user.name}
                    required
                    placeholder="Nama Anda"
                    className="w-full h-10 px-3.5 bg-[#FAF9F6] border border-[#D6D3D1] rounded-lg text-xs text-[#1C1917] focus:border-[#D97706] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1C1917] mb-1">Email Akun (Tetap)</label>
                  <input
                    name="email"
                    defaultValue={user.email}
                    disabled
                    className="w-full h-10 px-3.5 bg-[#F3F1ED] border border-[#E5E2DC] rounded-lg text-xs text-[#78716C] cursor-not-allowed"
                    title="Alamat email tidak dapat diubah"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1C1917] mb-1">No. WhatsApp *</label>
                  <input
                    name="phone"
                    defaultValue={user.phone ?? ''}
                    placeholder="08xxxxxxxxxx"
                    className="w-full h-10 px-3.5 bg-[#FAF9F6] border border-[#D6D3D1] rounded-lg text-xs text-[#1C1917] focus:border-[#D97706] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1C1917] mb-1">Kota / Domisili</label>
                  <input
                    name="city"
                    defaultValue={user.city ?? ''}
                    placeholder="Kota domisili"
                    className="w-full h-10 px-3.5 bg-[#FAF9F6] border border-[#D6D3D1] rounded-lg text-xs text-[#1C1917] focus:border-[#D97706] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1C1917] mb-1">Alamat Lengkap</label>
                  <textarea
                    name="address"
                    defaultValue={user.address ?? ''}
                    rows={3}
                    placeholder="Alamat rumah pengantaran"
                    className="w-full p-3 bg-[#FAF9F6] border border-[#D6D3D1] rounded-lg text-xs text-[#1C1917] focus:border-[#D97706] focus:outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={pending}
                  className="w-full h-11 bg-[#D97706] hover:bg-[#B45309] text-white text-xs font-bold rounded-xl shadow-xs transition active:scale-95 disabled:opacity-40"
                >
                  {pending ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </form>

              {/* Special Role Switcher if Staff / Owner is logged in */}
              <div className="pt-3 border-t border-[#E5E2DC] flex items-center justify-between">
                {['SUPERADMIN', 'OWNER', 'ADMIN', 'STAFF', 'SUPPLIER', 'FINANCE'].includes(
                  user.role
                ) && (
                    <Link
                      href={
                        user.role === 'SUPPLIER'
                          ? '/dashboard/supplier'
                          : user.role === 'FINANCE'
                            ? '/dashboard/finance'
                            : user.role === 'ADMIN' || user.role === 'STAFF'
                              ? '/dashboard/admin'
                              : '/dashboard/owner'
                      }
                      className="text-xs font-bold text-[#D97706] hover:underline"
                    >
                      → Masuk Dashboard {user.role}
                    </Link>
                  )}

                <button
                  type="button"
                  disabled={pending}
                  onClick={async () => {
                    const { logoutAction } = await import('@/lib/authActions')
                    await logoutAction()
                    window.location.href = '/'
                  }}
                  className="ml-auto text-xs font-bold text-[#DC2626] hover:underline"
                >
                  Keluar Akun
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Order History and Automated Payment Confirmations */}
          <div className="lg:col-span-8 space-y-5">
            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 bg-white border border-[#E5E2DC] rounded-xl text-center shadow-xs">
                <span className="block text-[10px] font-bold tracking-wider uppercase text-[#78716C]">
                  Total Pesanan
                </span>
                <span className="block text-xl font-extrabold font-mono text-[#1C1917] mt-1">
                  {orders.length}
                </span>
              </div>
              <div className="p-4 bg-[#FEF3C7]/60 border border-[#FDE68A] rounded-xl text-center">
                <span className="block text-[10px] font-bold tracking-wider uppercase text-[#92400E]">
                  Menunggu Bayar
                </span>
                <span className="block text-xl font-extrabold font-mono text-[#92400E] mt-1">
                  {pendingOrders.length}
                </span>
              </div>
              <div className="p-4 bg-[#D1FAE5]/60 border border-[#A7F3D0] rounded-xl text-center">
                <span className="block text-[10px] font-bold tracking-wider uppercase text-[#065F46]">
                  Lunas / Selesai
                </span>
                <span className="block text-xl font-extrabold font-mono text-[#065F46] mt-1">
                  {doneOrders.length}
                </span>
              </div>
            </div>

            {/* Orders List */}
            <div className="p-6 bg-white border border-[#E5E2DC] rounded-2xl shadow-xs space-y-4">
              <div>
                <h3 className="text-base font-extrabold text-[#1C1917]">Riwayat Pesanan Anda</h3>
                <p className="text-xs text-[#78716C] mt-0.5">
                  Daftar transaksi dan verifikasi otomatis status pembayaran
                </p>
              </div>

              {orders.length === 0 ? (
                <div className="py-12 text-center border border-dashed border-[#E5E2DC] rounded-xl">
                  <p className="text-sm font-semibold text-[#57534E]">Belum ada transaksi</p>
                  <Link
                    href="/#katalog"
                    className="mt-2 inline-block text-xs font-bold text-[#D97706] hover:underline"
                  >
                    Beli Tahu Sumedang Sekarang →
                  </Link>
                </div>
              ) : (
                <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1">
                  {orders.map((o) => {
                    const isPendingPayment =
                      o.paymentStatus === 'UNPAID' || o.paymentStatus === 'PENDING' || o.paymentStatus === 'WAITING_VERIFICATION'

                    return (
                      <div
                        key={o.id}
                        className="p-4 bg-[#FAF9F6] border border-[#E5E2DC] rounded-xl hover:border-[#D6D3D1] transition space-y-2.5"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-[#D97706]">
                                {o.orderNumber}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${o.paymentStatus === 'PAID'
                                  ? 'bg-[#D1FAE5] text-[#065F46] border border-[#A7F3D0]'
                                  : o.paymentStatus === 'WAITING_VERIFICATION'
                                    ? 'bg-amber-100 text-amber-900 border border-amber-300 font-extrabold'
                                    : o.paymentStatus === 'REJECTED'
                                      ? 'bg-red-50 text-red-700 border border-red-200'
                                      : 'bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]'
                                  }`}
                              >
                                {o.paymentStatus === 'WAITING_VERIFICATION' ? 'Menunggu Verifikasi' : o.paymentStatus}
                              </span>
                            </div>
                            <span className="block text-xs font-semibold text-[#1C1917] mt-1">
                              {o.items.map((i) => i.product.name).join(', ')}
                            </span>
                            {o.vaNumber && (
                              <span className="block text-[11px] font-mono text-[#065F46]">
                                Virtual Account: {o.vaNumber}
                              </span>
                            )}
                          </div>

                          <div className="text-left sm:text-right shrink-0">
                            <span className="block text-sm font-extrabold font-mono text-[#1C1917]">
                              {formatRupiah(o.totalAmount)}
                            </span>
                            <span className="block text-[11px] text-[#78716C] mt-0.5">
                              {o.status} · {o.paymentMethod}
                            </span>
                          </div>
                        </div>

                        {/* Payment Proof Action for Customer */}
                        {isPendingPayment && o.paymentMethod !== 'COD' && (
                          <div className="pt-2 border-t border-[#E5E2DC] flex items-center justify-between gap-2 flex-wrap">
                            <span className="text-[11px] text-[#78716C]">
                              {o.paymentProofUrl
                                ? 'Bukti transfer sudah diunggah. Menunggu verifikasi Finance.'
                                : 'Sudah melakukan pembayaran? Unggah screenshot bukti transfer:'}
                            </span>
                            <div className="flex items-center gap-2">
                              {o.paymentProofUrl && (
                                <button
                                  type="button"
                                  onClick={() => setPreviewProofUrl(o.paymentProofUrl!)}
                                  className="px-2.5 py-1.5 bg-white border border-[#D6D3D1] text-[11px] font-bold rounded-lg text-[#1C1917] hover:bg-[#FAF9F6]"
                                >
                                  Lihat Bukti
                                </button>
                              )}
                              <button
                                type="button"
                                disabled={pending || uploadingOrder === o.orderNumber}
                                onClick={() => handleSelectProofFile(o.orderNumber)}
                                className="px-3.5 py-1.5 bg-[#1C1917] hover:bg-[#292524] text-white rounded-lg text-xs font-bold transition shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                              >
                                {uploadingOrder === o.orderNumber
                                  ? 'Mengunggah...'
                                  : o.paymentProofUrl
                                    ? 'Unggah Ulang Bukti'
                                    : ' Unggah Bukti Bayar'}
                              </button>
                            </div>
                          </div>
                        )}


                        {/* Status Narrative & Interactive Stepper */}
                        {(() => {
                          const statusInfo = STATUS_PROGRESS_MAP[o.status] ?? {
                            stepIndex: 0,
                            title: o.status,
                            desc: 'Status pesanan sedang diperbarui.',
                          }
                          const curStep = statusInfo.stepIndex

                          return (
                            <div className="pt-2 pb-1 space-y-3">
                              {/* Highlighted Status Callout */}
                              <div className="p-3 bg-white border border-[#E5E2DC] rounded-xl flex items-start gap-2.5 shadow-2xs">
                                <div
                                  className={`size-2.5 rounded-full mt-1 shrink-0 ${
                                    curStep === 4
                                      ? 'bg-emerald-500'
                                      : curStep === -1
                                      ? 'bg-stone-400'
                                      : 'bg-[#D97706] animate-pulse'
                                  }`}
                                />
                                <div>
                                  <p className="text-xs font-bold text-[#1C1917] tracking-tight">
                                    {statusInfo.title}
                                  </p>
                                  <p className="text-[11px] text-[#57534E] mt-0.5 leading-relaxed">
                                    {statusInfo.desc}
                                  </p>
                                </div>
                              </div>

                              {/* Modern Stepper Track */}
                              {curStep >= 0 && (
                                <div className="px-1 py-1">
                                  <div className="relative flex items-center justify-between">
                                    {/* Background Track Line */}
                                    <div className="absolute top-3 sm:top-3.5 left-[8%] right-[8%] h-1 bg-[#E5E2DC] -z-0 rounded-full" />
                                    {/* Filled Active Line */}
                                    <div
                                      className="absolute top-3 sm:top-3.5 left-[8%] h-1 bg-gradient-to-r from-emerald-500 to-[#D97706] -z-0 rounded-full transition-all duration-500"
                                      style={{
                                        width: `${Math.min(84, (curStep / 4) * 84)}%`,
                                      }}
                                    />

                                    {ORDER_STEPS.map((st, i) => {
                                      const isPassed = curStep > i
                                      const isCurrent = curStep === i

                                      return (
                                        <div
                                          key={st.key}
                                          className="flex flex-col items-center text-center relative z-10 w-14 sm:w-20"
                                        >
                                          <div
                                            className={`size-6 sm:size-7 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold transition-all ${
                                              isCurrent
                                                ? 'bg-[#D97706] text-white ring-4 ring-[#D97706]/20 scale-110 shadow-sm'
                                                : isPassed
                                                ? 'bg-emerald-600 text-white shadow-2xs'
                                                : 'bg-white border-2 border-[#D6D3D1] text-[#A8A29E]'
                                            }`}
                                          >
                                            {isPassed ? (
                                              <svg className="w-3.5 h-3.5 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                              </svg>
                                            ) : (
                                              i + 1
                                            )}
                                          </div>
                                          <span
                                            className={`mt-1.5 text-[9px] sm:text-[10px] leading-tight font-medium ${
                                              isCurrent
                                                ? 'font-bold text-[#D97706]'
                                                : isPassed
                                                ? 'font-semibold text-[#1C1917]'
                                                : 'text-[#A8A29E]'
                                            }`}
                                          >
                                            <span className="sm:hidden">{st.short}</span>
                                            <span className="hidden sm:inline">{st.label}</span>
                                          </span>
                                        </div>
                                      )
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })()}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          <button onClick={() => printInvoice(o)} className="px-2.5 py-1 bg-white border border-[#E5E2DC] rounded-lg text-[11px] font-semibold hover:bg-[#FAF9F6] text-[#1C1917] transition cursor-pointer">Cetak Invoice</button>
                          {o.status !== 'CANCELLED' && o.status !== 'DELIVERED' && (
                            <button disabled={pending} onClick={async () => { const r = prompt('Alasan batal?'); if (r === null) return; const { cancelOrder } = await import('@/lib/actions'); const res = await cancelOrder(o.orderNumber, r || undefined); setMsg({ text: res.message, err: !res.success }); setTimeout(() => setMsg(null), 3500) }} className="px-2.5 py-1 bg-white border border-red-200 text-[#DC2626] rounded-lg text-[11px] font-bold hover:bg-red-50 disabled:opacity-40">Batalkan</button>
                          )}
                          {o.paymentStatus === 'PAID' && o.status !== 'RETURN_REQUESTED' && o.status !== 'CANCELLED' && (
                            <button disabled={pending} onClick={async () => { const r = prompt('Alasan retur?'); if (!r) return; const { requestReturn } = await import('@/lib/actions'); const res = await requestReturn(o.orderNumber, r); setMsg({ text: res.message, err: !res.success }); setTimeout(() => setMsg(null), 3500) }} className="px-2.5 py-1 bg-white border border-[#E5E2DC] rounded-lg text-[11px] font-bold hover:bg-[#FAF9F6] disabled:opacity-40">Ajukan Retur</button>
                          )}
                        </div>

                        <span className="block text-[10px] text-[#A8A29E]">
                          Dibuat pada: {new Date(o.createdAt).toLocaleString('id-ID')}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hidden File Input for Proof Upload */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Modal Preview Bukti Bayar Pelanggan */}
      {previewProofUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" style={{ isolation: 'isolate' }}>
          <div className="relative w-full max-w-md bg-white border border-[#E5E2DC] rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E2DC]">
              <h3 className="text-sm font-extrabold text-[#1C1917]">Bukti Transfer Anda</h3>
              <button
                type="button"
                onClick={() => setPreviewProofUrl(null)}
                className="w-7 h-7 rounded-full bg-[#FAF9F6] border border-[#E5E2DC] flex items-center justify-center text-xs text-[#78716C] hover:bg-white"
              >
                ✕
              </button>
            </div>
            <div className="relative max-h-[60vh] overflow-y-auto rounded-xl border border-[#E5E2DC] bg-[#FAF9F6] p-2 flex items-center justify-center">
              <img
                src={previewProofUrl}
                alt="Bukti Transfer"
                className="max-w-full max-h-[55vh] object-contain rounded-lg"
              />
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setPreviewProofUrl(null)}
                className="px-4 py-2 bg-[#FAF9F6] border border-[#E5E2DC] text-xs font-bold rounded-xl text-[#57534E] hover:bg-white"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
