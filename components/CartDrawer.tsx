'use client'

import { useRef, useEffect } from 'react'
import type { CartItem } from '@/lib/types'
import { formatRupiah } from '@/lib/utils'
import { getProductImageUrl } from '@/lib/productImage'

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
  cart: CartItem[]
  onUpdateQty: (productId: number, delta: number) => void
  onRemove: (productId: number) => void
  onClear: () => void
  onCheckout: () => void
}

export function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQty,
  onRemove,
  onClear,
  onCheckout,
}: CartDrawerProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    import('gsap').then(({ gsap }) => {
      gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.25 })
      gsap.fromTo(panelRef.current, { x: '100%' }, { x: '0%', duration: 0.35, ease: 'power3.out' })
    })

    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [isOpen])

  const handleClose = () => {
    import('gsap').then(({ gsap }) => {
      const tl = gsap.timeline({ onComplete: onClose })
      tl.to(panelRef.current, { x: '100%', duration: 0.25, ease: 'power2.in' })
      tl.to(overlayRef.current, { opacity: 0, duration: 0.15 }, '-=0.1')
    })
  }

  if (!isOpen) return null

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div
      className="fixed inset-0 z-[70]"
      style={{ isolation: 'isolate' }}
    >
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={handleClose}
      />

      <div
        ref={panelRef}
        className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white border-l border-[#E5E2DC] flex flex-col shadow-2xl z-10 text-[#1C1917]"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#E5E2DC] flex items-center justify-between bg-white">
          <div>
            <h2 className="text-lg font-bold text-[#1C1917] tracking-tight">Keranjang Belanja</h2>
            <span className="text-xs text-[#78716C]">
              {totalItems} item dipilih
            </span>
          </div>
          <div className="flex items-center gap-3">
            {cart.length > 0 && (
              <button
                onClick={onClear}
                className="text-xs text-[#78716C] hover:text-[#DC2626] font-medium transition-colors"
              >
                Kosongkan
              </button>
            )}
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-full border border-[#E5E2DC] flex items-center justify-center text-[#78716C] hover:text-[#1C1917] hover:bg-[#F3F1ED] transition"
              aria-label="Tutup keranjang"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Cart items list */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 bg-[#FAF9F6]">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-16 h-16 rounded-full bg-[#F3F1ED] border border-[#E5E2DC] flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#A8A29E]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-[#1C1917]">Keranjang Anda Kosong</p>
              <p className="text-xs text-[#78716C] mt-1 max-w-xs">
                Silakan pilih paket tahu goreng hangat dari katalog menu kami.
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.productId}
                className="flex gap-3.5 p-3.5 bg-white border border-[#E5E2DC] rounded-xl shadow-xs hover:border-[#D6D3D1] hover:shadow-sm transition-all duration-200"
              >
                {/* Thumbnail */}
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-[#F3F1ED] shrink-0 border border-[#E5E2DC]">
                  {(() => {
                    const s = getProductImageUrl({ name: item.name, image: item.image })
                    return s ? (
                      <img src={s} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#A8A29E]">◇</div>
                    )
                  })()}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-[#1C1917] truncate">
                    {item.name}
                  </h4>
                  <span className="block text-xs font-bold text-[#D97706] font-[family-name:var(--font-mono)] mt-0.5">
                    {formatRupiah(item.price)}
                  </span>

                  <div className="flex items-center justify-between mt-2.5">
                    {/* Quantity Selector */}
                    <div className="flex items-center border border-[#D6D3D1] rounded-lg overflow-hidden bg-[#FAF9F6]">
                      <button
                        onClick={() => onUpdateQty(item.productId, -1)}
                        className="w-7 h-6 text-xs text-[#57534E] hover:text-[#1C1917] hover:bg-[#E5E2DC] active:scale-90 active:bg-[#D6D3D1] transition-all flex items-center justify-center font-bold cursor-pointer"
                        aria-label="Kurangi jumlah"
                      >
                        −
                      </button>
                      <span className="px-2.5 text-xs font-bold font-[family-name:var(--font-mono)] text-[#1C1917] border-x border-[#D6D3D1] bg-white h-6 flex items-center select-none">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQty(item.productId, 1)}
                        className="w-7 h-6 text-xs text-[#57534E] hover:text-[#1C1917] hover:bg-[#E5E2DC] active:scale-90 active:bg-[#D6D3D1] transition-all flex items-center justify-center font-bold cursor-pointer"
                        aria-label="Tambah jumlah"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => onRemove(item.productId)}
                      className="text-xs text-[#78716C] hover:text-[#DC2626] active:scale-95 transition-all font-medium cursor-pointer"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Checkout Trigger */}
        {cart.length > 0 && (
          <div className="px-6 py-5 border-t border-[#E5E2DC] bg-white space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[#57534E]">Total Sementara</span>
              <span className="text-xl font-extrabold font-[family-name:var(--font-mono)] text-[#1C1917]">
                {formatRupiah(subtotal)}
              </span>
            </div>
            <button
              onClick={() => {
                handleClose()
                setTimeout(onCheckout, 250)
              }}
              className="w-full py-3.5 bg-[#D97706] hover:bg-[#B45309] text-white text-sm font-bold tracking-wide rounded-xl shadow-[0_4px_14px_rgba(217,119,6,0.25)] active:scale-[0.98] transition-all"
            >
              Lanjut ke Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
