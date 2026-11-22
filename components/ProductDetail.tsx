'use client'

import { useRef, useEffect, useState } from 'react'
import type { Product } from '@/lib/types'
import { formatRupiah, cn } from '@/lib/utils'
import { getProductImageUrl } from '@/lib/productImage'
import { ProductReviews } from './ProductReviews'

interface ProductDetailProps {
  product: Product | null
  onClose: () => void
  onAddToCart: (product: Product, qty: number) => void
  onBuyNow?: (product: Product, qty: number) => void
}

export function ProductDetail({ product, onClose, onAddToCart, onBuyNow }: ProductDetailProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const [addedToCart, setAddedToCart] = useState(false)

  useEffect(() => {
    if (!product) return
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    import('gsap').then(({ gsap }) => {
      gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: 'power2.out' })
      gsap.fromTo(panelRef.current, { x: '100%' }, { x: '0%', duration: 0.35, ease: 'power2.out' })
    })

    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [product])

  const handleClose = () => {
    import('gsap').then(({ gsap }) => {
      const tl = gsap.timeline({ onComplete: onClose })
      tl.to(panelRef.current, { x: '100%', duration: 0.25, ease: 'power2.in' })
      tl.to(overlayRef.current, { opacity: 0, duration: 0.15 }, '-=0.1')
    })
  }

  if (!product) return null

  const discount =
    product.originalPrice
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0

  return (
    <div className="fixed inset-0 z-[60]" style={{ isolation: 'isolate' }}>
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={handleClose}
      />

      {/* Slide-in panel */}
      <div
        ref={panelRef}
        className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-white border-l border-[#E5E2DC] overflow-y-auto shadow-2xl z-10 text-[#1C1917]"
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/90 border border-[#E5E2DC] flex items-center justify-center text-[#78716C] hover:text-[#1C1917] hover:bg-[#F3F1ED] transition shadow-xs cursor-pointer"
          aria-label="Tutup"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Hero Image */}
        <div className="relative aspect-[4/3] bg-[#F3F1ED]">
          {(() => {
            const src = product ? getProductImageUrl(product) : ''
            return src ? (
              <img src={src} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl text-[#A8A29E]">◇</div>
            )
          })()}

          {/* Badges */}
          <div className="absolute top-4 left-4 flex gap-2">
            {product.badge && (
              <span className="px-3 py-1 text-[11px] font-bold tracking-wider uppercase bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] rounded-md shadow-xs">
                {product.badge}
              </span>
            )}
            {discount > 0 && (
              <span className="px-2.5 py-1 text-[11px] font-bold bg-[#DC2626] text-white rounded-md font-[family-name:var(--font-mono)] shadow-xs">
                Hemat {discount}%
              </span>
            )}
          </div>
        </div>

        {/* Content body */}
        <div className="p-6 sm:p-8 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#78716C] font-bold tracking-[0.15em] uppercase">
                {product.category}
              </span>
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#FAF9F6] border border-[#E5E2DC] rounded-full text-xs font-semibold text-[#1C1917]">
                <span className="text-[#D97706]">★</span>
                <span>{product.rating.toFixed(1)}</span>
                <span className="text-[#78716C]">({product.reviewCount} ulasan)</span>
              </div>
            </div>

            <h2 className="text-2xl font-extrabold text-[#1C1917] tracking-tight leading-snug">
              {product.name}
            </h2>

            {/* Price display */}
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#1C1917] font-[family-name:var(--font-mono)]">
                {formatRupiah(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-[#A8A29E] line-through font-[family-name:var(--font-mono)]">
                  {formatRupiah(product.originalPrice)}
                </span>
              )}
            </div>
          </div>

          <div className="divider" />

          {/* Description */}
          <div>
            <h3 className="text-xs font-bold text-[#78716C] tracking-[0.12em] uppercase mb-2">
              Deskripsi Menu
            </h3>
            <p className="text-sm text-[#57534E] leading-relaxed">
              {product.description ||
                'Tahu Sumedang asli khas Priangan. Dibuat segar dari kedelai pilihan dengan bumbu tradisional, menghasilkan tekstur renyah garing di luar dan lembut kopong di dalam.'}
            </p>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Stok Toko', value: product.stock > 0 ? `${product.stock} pcs` : 'Habis' },
              { label: 'Terjual', value: `${product.soldCount}+` },
              { label: 'Suhu Saji', value: 'Hangat Dadakan' },
            ].map((info) => (
              <div
                key={info.label}
                className="p-3 bg-[#FAF9F6] border border-[#E5E2DC] rounded-xl text-center"
              >
                <span className="block text-[10px] text-[#78716C] font-semibold tracking-wider uppercase mb-1">
                  {info.label}
                </span>
                <span className="block text-xs font-bold text-[#1C1917]">
                  {info.value}
                </span>
              </div>
            ))}
          </div>

          <div className="divider" />

          {/* Action buttons: Tambah ke Keranjang & Beli Sekarang */}
          <div className="space-y-3">
            {onBuyNow && (
              <button
                onClick={() => onBuyNow(product, 1)}
                disabled={product.stock === 0}
                className="w-full py-3.5 bg-[#D97706] hover:bg-[#B45309] text-white text-sm font-bold tracking-wide rounded-xl shadow-[0_4px_14px_rgba(217,119,6,0.25)] active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                <span>{product.stock > 0 ? 'Beli Sekarang' : 'Stok Habis Sementara'}</span>
              </button>
            )}

            <button
              onClick={() => {
                if (product.stock > 0) {
                  setAddedToCart(true)
                  onAddToCart(product, 1)
                  setTimeout(() => setAddedToCart(false), 900)
                }
              }}
              disabled={product.stock === 0}
              className={cn(
                "w-full py-3.5 text-sm font-bold tracking-wide rounded-xl active:scale-[0.98] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer border",
                addedToCart
                  ? "bg-[#059669] text-white border-transparent shadow-[0_4px_14px_rgba(5,150,105,0.3)]"
                  : "bg-white hover:bg-[#F3F1ED] text-[#1C1917] border-[#D6D3D1]"
              )}
            >
              {addedToCart ? (
                <>
                  <svg className="w-5 h-5 animate-pop-badge" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <span>✓ Berhasil Ditambahkan!</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 text-[#D97706]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  <span>+ Tambah ke Keranjang</span>
                </>
              )}
            </button>
          </div>
          <ProductReviews productId={product.id} productName={product.name} />
        </div>
      </div>
    </div>
  )
}
