'use client'

import { useRef, useEffect, useState, useTransition } from 'react'
import type { CartItem } from '@/lib/types'
import { createOrder, getUserProfile, type CheckoutPayload, type UserProfileData } from '@/lib/actions'
import { formatRupiah } from '@/lib/utils'

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  cart: CartItem[]
  initialProfile?: UserProfileData | null
  onSuccess: (orderNumber: string, paymentMethod: string, vaNumber?: string, qrisPayload?: string, totalAmount?: number) => void
}

const SHIPPING_OPTIONS = [
  { id: 'pickup', label: 'Ambil di Toko', cost: 0 },
  { id: 'motor', label: 'Kurir Motor', cost: 8000 },
  { id: 'jne', label: 'JNE Reguler', cost: 15000 },
] as const

type ShippingOpt = (typeof SHIPPING_OPTIONS)[number]

const PAYMENT_OPTIONS = [
  { id: 'TRANSFER_BCA', label: 'Transfer Bank BCA', sub: 'No Rek: 5020348994 a.n. Ernest William' },
  { id: 'QRIS', label: 'QRIS', sub: 'Semua e-wallet & m-banking' },
  { id: 'COD', label: 'COD (Cash On Delivery)', sub: 'Bayar tunai ke kurir saat barang sampai' },
] as const

export function CheckoutModal({ isOpen, onClose, cart, initialProfile, onSuccess }: CheckoutModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [shipping, setShipping] = useState<ShippingOpt>(SHIPPING_OPTIONS[0] as ShippingOpt)
  const [payment, setPayment] = useState<string>('TRANSFER_BCA')
  const [voucher, setVoucher] = useState('')
  const [discount, setDiscount] = useState(0)
  const [voucherMsg, setVoucherMsg] = useState<string | null>(null)

  // Form field states for editable auto-fill
  const [name, setName] = useState(initialProfile?.name || '')
  const [phone, setPhone] = useState(initialProfile?.phone || '')
  const [email, setEmail] = useState(initialProfile?.email || '')
  const [address, setAddress] = useState(initialProfile?.address || '')
  const [city, setCity] = useState(initialProfile?.city || 'Sumedang')
  const [postalCode, setPostalCode] = useState(initialProfile?.postalCode || '')
  const [notes, setNotes] = useState('')

  // If initialProfile changes or when modal opens, sync with profile if inputs were untouched
  useEffect(() => {
    if (!isOpen) return
    if (initialProfile) {
      setName(prev => prev || initialProfile.name || '')
      setPhone(prev => prev || initialProfile.phone || '')
      setEmail(prev => prev || initialProfile.email || '')
      setAddress(prev => prev || initialProfile.address || '')
      setCity(prev => (prev && prev !== 'Sumedang' ? prev : initialProfile.city || 'Sumedang'))
      setPostalCode(prev => prev || initialProfile.postalCode || '')
    } else {
      // If initialProfile was not passed from parent, fetch asynchronously
      getUserProfile().then((profile) => {
        if (profile) {
          setName(prev => prev || profile.name || '')
          setPhone(prev => prev || profile.phone || '')
          setEmail(prev => prev || profile.email || '')
          setAddress(prev => prev || profile.address || '')
          setCity(prev => (prev && prev !== 'Sumedang' ? prev : profile.city || 'Sumedang'))
          setPostalCode(prev => prev || profile.postalCode || '')
        }
      }).catch(console.error)
    }
  }, [isOpen, initialProfile])
  const subtotalPreview = cart.reduce((s, i) => s + i.price * i.quantity, 0)
  const applyVoucher = async () => {
    const { validateVoucher } = await import('@/lib/actions')
    const r = await validateVoucher(voucher, subtotalPreview)
    setVoucherMsg(r.message)
    setDiscount(r.valid ? r.discount : 0)
  }

  useEffect(() => {
    if (!isOpen) return
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    import('gsap').then(({ gsap }) => {
      gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.25 })
      gsap.fromTo(panelRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, ease: 'power3.out' })
    })
    return () => { document.body.style.overflow = originalOverflow }
  }, [isOpen])

  const handleClose = () => {
    import('gsap').then(({ gsap }) => {
      const tl = gsap.timeline({ onComplete: onClose })
      tl.to(panelRef.current, { y: 16, opacity: 0, duration: 0.2, ease: 'power2.in' })
      tl.to(overlayRef.current, { opacity: 0, duration: 0.15 }, '-=0.1')
    })
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const payload: CheckoutPayload = {
      customerName: name,
      customerPhone: phone,
      customerEmail: email || undefined,
      address,
      city,
      postalCode: postalCode || undefined,
      notes: notes || undefined,
      shippingMethod: shipping.label,
      shippingCost: shipping.cost,
      paymentMethod: payment,
      discount,
      items: cart.map((item) => ({ productId: item.productId, quantity: item.quantity, price: item.price })),
    }
    startTransition(async () => {
      const result = await createOrder(payload)
      const total = payload.items.reduce((s, i) => s + i.price * i.quantity, 0) + payload.shippingCost - payload.discount
      if (result.success && result.orderNumber) onSuccess(result.orderNumber, payment, result.vaNumber, result.qrisPayload, total)
      else setError(result.message)
    })
  }

  if (!isOpen) return null

  const subtotal = subtotalPreview
  const total = Math.max(0, subtotal + shipping.cost - discount)

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto" style={{ isolation: 'isolate' }}>
      <div ref={overlayRef} className="fixed inset-0 bg-black/60 backdrop-blur-sm -z-10" onClick={handleClose} />

      <div
        ref={panelRef}
        className="relative z-10 w-full max-w-xl max-h-[92vh] overflow-y-auto bg-white border border-[#E5E2DC] rounded-2xl shadow-2xl my-auto text-[#1C1917]"
      >
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md px-6 sm:px-7 py-5 border-b border-[#E5E2DC] flex items-center justify-between">
          <h2 className="text-base font-bold tracking-tight text-[#1C1917]">Checkout</h2>
          <button onClick={handleClose} className="w-8 h-8 rounded-full border border-[#E5E2DC] flex items-center justify-center text-[#78716C] hover:text-[#1C1917] hover:bg-[#FAF9F6] transition" aria-label="Tutup">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 sm:px-7 py-7 space-y-7">
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700">{error}</div>}

          <div className="rounded-xl border border-[#E5E2DC] bg-[#FAF9F6] p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-[0.12em] uppercase text-[#78716C]">Ringkasan Pesanan</span>
              <span className="text-xs font-semibold text-[#57534E]">{cart.length} item</span>
            </div>
            <ul className="mt-3 space-y-2">
              {cart.map((it) => (
                <li key={it.productId} className="flex justify-between text-xs">
                  <span className="text-[#1C1917] font-medium truncate pr-4">{it.name} × {it.quantity}</span>
                  <span className="font-mono font-semibold text-[#1C1917] shrink-0">{formatRupiah(it.price * it.quantity)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold tracking-[0.12em] uppercase text-[#78716C]">Informasi Pemesan</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#1C1917] mb-1.5">Nama Lengkap *</label>
                <input
                  name="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama pemesan"
                  className="w-full h-11 px-4 bg-white border border-[#D6D3D1] rounded-xl text-sm focus:border-[#D97706] focus:ring-2 focus:ring-[#D97706]/15 focus:outline-none transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1C1917] mb-1.5">No. WhatsApp *</label>
                <input
                  name="phone"
                  required
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="08xxxxxxxxxx"
                  className="w-full h-11 px-4 bg-white border border-[#D6D3D1] rounded-xl text-sm focus:border-[#D97706] focus:ring-2 focus:ring-[#D97706]/15 focus:outline-none transition"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#1C1917] mb-1.5">Email <span className="font-normal text-[#78716C]">(opsional)</span></label>
              <input
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full h-11 px-4 bg-white border border-[#D6D3D1] rounded-xl text-sm focus:border-[#D97706] focus:ring-2 focus:ring-[#D97706]/15 focus:outline-none transition"
              />
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold tracking-[0.12em] uppercase text-[#78716C]">Alamat Pengiriman</h3>
            <div>
              <label className="block text-xs font-semibold text-[#1C1917] mb-1.5">Alamat Lengkap *</label>
              <textarea
                name="address"
                required
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Jalan, nomor rumah, RT/RW, patokan lokasi"
                className="w-full p-3 bg-white border border-[#D6D3D1] rounded-xl text-sm focus:border-[#D97706] focus:ring-2 focus:ring-[#D97706]/15 focus:outline-none transition resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#1C1917] mb-1.5">Kota *</label>
                <input
                  name="city"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Kota / Kabupaten"
                  className="w-full h-11 px-4 bg-white border border-[#D6D3D1] rounded-xl text-sm focus:border-[#D97706] focus:ring-2 focus:ring-[#D97706]/15 focus:outline-none transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1C1917] mb-1.5">Kode Pos</label>
                <input
                  name="postalCode"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="—"
                  className="w-full h-11 px-4 bg-white border border-[#D6D3D1] rounded-xl text-sm focus:border-[#D97706] focus:ring-2 focus:ring-[#D97706]/15 focus:outline-none transition"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#1C1917] mb-1.5">Catatan Pesanan <span className="font-normal text-[#78716C]">(opsional)</span></label>
              <input
                name="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Sambal dipisah, goreng sangat kering, dll."
                className="w-full h-11 px-4 bg-white border border-[#D6D3D1] rounded-xl text-sm focus:border-[#D97706] focus:ring-2 focus:ring-[#D97706]/15 focus:outline-none transition"
              />
            </div>
          </div>

          <div className="space-y-2.5">
            <h3 className="text-xs font-bold tracking-[0.12em] uppercase text-[#78716C]">Pengiriman</h3>
            <div className="grid grid-cols-1 gap-2">
              {SHIPPING_OPTIONS.map((opt) => {
                const active = shipping.id === opt.id
                return (
                  <button key={opt.id} type="button" onClick={() => setShipping(opt)} className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition ${active ? 'border-[#D97706] bg-[#FEF3C7]/40 ring-1 ring-[#D97706]' : 'border-[#E5E2DC] bg-white hover:border-[#D6D3D1]'}`}>
                    <span className="flex items-center gap-3">
                      <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${active ? 'border-[#D97706]' : 'border-[#A8A29E]'}`}>{active && <span className="w-2 h-2 rounded-full bg-[#D97706]" />}</span>
                      <span className="text-sm font-semibold">{opt.label}</span>
                    </span>
                    <span className="text-xs font-mono font-bold">{opt.cost === 0 ? <span className="text-[#059669]">Gratis</span> : formatRupiah(opt.cost)}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-2.5">
            <h3 className="text-xs font-bold tracking-[0.12em] uppercase text-[#78716C]">Metode Pembayaran</h3>
            <p className="text-[11px] text-[#78716C]">Pembayaran akan diproses ke Rekening Operasional BCA 8880123456 a.n. Tahu Sumedang Official.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {PAYMENT_OPTIONS.map((opt) => {
                const active = payment === opt.id
                return (
                  <button key={opt.id} type="button" onClick={() => setPayment(opt.id)} className={`p-4 rounded-xl border text-left transition ${active ? 'border-[#D97706] bg-[#FEF3C7]/40 ring-1 ring-[#D97706]' : 'border-[#E5E2DC] bg-white hover:border-[#D6D3D1]'}`}>
                    <span className="flex items-center gap-2">
                      <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${active ? 'border-[#D97706]' : 'border-[#A8A29E]'}`}>{active && <span className="w-2 h-2 rounded-full bg-[#D97706]" />}</span>
                      <span className="text-sm font-bold leading-none">{opt.label}</span>
                    </span>
                    <span className="block text-[11px] text-[#78716C] mt-1.5 ml-6">{opt.sub}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-bold tracking-[0.12em] uppercase text-[#78716C]">Voucher</h3>
            <div className="flex gap-2">
              <input value={voucher} onChange={(e) => setVoucher(e.target.value)} placeholder="TAHU10 / SUMEDANG20 / GRATISONGKIR" className="flex-1 h-10 px-3.5 bg-white border border-[#D6D3D1] rounded-xl text-xs font-mono uppercase placeholder:normal-case text-[#1C1917] focus:border-[#D97706] focus:outline-none" />
              <button type="button" onClick={applyVoucher} className="px-4 h-10 bg-white border border-[#E5E2DC] rounded-xl text-xs font-bold hover:bg-[#FAF9F6]">Terapkan</button>
            </div>
            {voucherMsg && <p className={`text-[11px] font-semibold ${discount ? 'text-[#059669]' : 'text-[#DC2626]'}`}>{voucherMsg} {discount ? `· -${formatRupiah(discount)}` : ''}</p>}
          </div>

          <div className="rounded-xl bg-[#1C1917] text-white p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] tracking-[0.14em] uppercase font-bold text-white/60">Total Pembayaran</p>
              <p className="text-[11px] text-white/50 mt-0.5">Subtotal {formatRupiah(subtotal)} + Ongkir {shipping.cost === 0 ? 'Gratis' : formatRupiah(shipping.cost)}{discount ? ` - Voucher ${formatRupiah(discount)}` : ''}</p>
            </div>
            <span className="text-lg font-extrabold font-mono tracking-tight">{formatRupiah(total)}</span>
          </div>

          <button type="submit" disabled={isPending || cart.length === 0} className="w-full py-4 bg-[#D97706] hover:bg-[#B45309] text-white text-sm font-bold rounded-xl shadow-[0_4px_14px_rgba(217,119,6,0.25)] active:scale-[0.98] transition disabled:opacity-40 flex items-center justify-center gap-2">
            {isPending ? <><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg> Memproses…</> : <>Bayar {formatRupiah(total)}</>}
          </button>
        </form>
      </div>
    </div>
  )
}
