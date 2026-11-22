'use client'

import { useRef, useEffect, useState } from 'react'
import type { Product } from '@/lib/types'
import { formatRupiah, cn } from '@/lib/utils'
import { getProductImageUrl } from '@/lib/productImage'

interface ProductCardProps {
  product: Product
  onSelect: (p: Product) => void
  onAddToCart: (p: Product) => void
  index: number
  isWishlisted?: boolean
  onToggleWishlist?: (id: number) => void
}

export function ProductCard({ product, onSelect, onAddToCart, index, isWishlisted, onToggleWishlist }: ProductCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [justAdded, setJustAdded] = useState(false)

  useEffect(() => {
    let cancelled = false
    const timer = setTimeout(() => {
      import('gsap')
        .then(({ gsap }) => {
          if (cancelled || !cardRef.current) return
          gsap.fromTo(
            cardRef.current,
            { y: 12 },
            { y: 0, duration: 0.4, delay: Math.min(index * 0.03, 0.25), ease: 'power2.out', overwrite: 'auto' }
          )
        })
        .catch(() => {})
    }, 20)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [index])

  const discount =
    product.originalPrice
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0

  return (
    <div
      ref={cardRef}
      className="group flex h-full min-h-0 flex-col bg-white border border-[#EDE9E3] rounded-[20px] overflow-hidden shadow-[0_2px_8px_rgba(28,25,23,0.04),0_8px_24px_rgba(28,25,23,0.05)] hover:border-[rgba(217,119,6,0.22)] hover:shadow-[0_8px_24px_rgba(28,25,23,0.08),0_16px_40px_rgba(28,25,23,0.06)] hover:-translate-y-1.5 transition-all duration-300 will-change-transform"
      style={{ transform: 'translateZ(0)' }}
    >
      {/* Product Image — fixed 4:3 with warm aura */}
      <div
        className="relative aspect-[4/3] w-full shrink-0 overflow-hidden cursor-pointer bg-gradient-to-br from-[#FFFBF5] to-[#F3F1ED]"
        onClick={() => onSelect(product)}
      >
        {(() => {
          const src = getProductImageUrl(product)
          return src ? (
            <img
              src={src}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              draggable={false}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#A8A29E] text-3xl">
              ◇
            </div>
          )
        })()}

        <div className="absolute inset-0 bg-gradient-to-t from-[#1C1917]/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges — premium */}
        <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
          {product.badge && (
            <span className="px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase bg-white/95 backdrop-blur text-[#9A3412] border border-[#FDE68A] rounded-full shadow-sm">
              {product.badge}
            </span>
          )}
          {discount > 0 && (
            <span className="px-2 py-1 text-[10px] font-bold tracking-wider text-white rounded-full shadow-sm" style={{ background: 'linear-gradient(135deg,#DC2626,#EF4444)' }}>
              -{discount}%
            </span>
          )}
        </div>
        {onToggleWishlist && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleWishlist(product.id)
            }}
            aria-label={isWishlisted ? 'Hapus favorit' : 'Tambah favorit'}
            className={cn(
              "absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md border shadow-sm transition-all duration-200 active:scale-125 cursor-pointer",
              isWishlisted
                ? 'bg-gradient-to-br from-[#FFF7ED] to-[#FFEDD5] border-[#FDBA74] text-[#D97706]'
                : 'bg-white/90 border-white/80 text-[#A8A29E] hover:text-[#D97706] hover:border-[#FDBA74]'
            )}
          >
            {isWishlisted ? '♥' : '♡'}
          </button>
        )}

        {/* Quick Add Button with feedback */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            if (product.stock > 0) {
              onAddToCart(product)
              setJustAdded(true)
              setTimeout(() => setJustAdded(false), 850)
            }
          }}
          disabled={product.stock <= 0}
          className={cn(
            "absolute bottom-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 shadow-[0_6px_16px_rgba(28,25,23,0.14)]",
            "opacity-100 sm:opacity-0 sm:group-hover:opacity-100 translate-y-0 sm:translate-y-1 sm:group-hover:translate-y-0",
            product.stock <= 0 && "opacity-40 cursor-not-allowed text-[#A8A29E] bg-white",
            product.stock > 0 && !justAdded && "bg-white text-[#1C1917] hover:text-white hover:scale-105 active:scale-95 cursor-pointer hover:bg-gradient-to-br hover:from-[#D97706] hover:to-[#EA8A1A]",
            justAdded && "bg-[#059669] text-white scale-110 shadow-[0_4px_14px_rgba(5,150,105,0.4)]"
          )}
          title={product.stock > 0 ? (justAdded ? "Ditambahkan!" : "Tambah ke keranjang") : "Stok habis"}
          aria-label={`Tambah ${product.name} ke keranjang`}
        >
          {justAdded ? (
            <svg className="w-4 h-4 animate-pop-badge" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          ) : (
            <svg className="w-4 h-4 transition-transform duration-200 group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          )}
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-1 min-h-0 flex-col p-5">
        <div className="flex-1 min-h-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-[#78716C] font-bold tracking-[0.14em] uppercase">
              {product.category}
            </span>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-[#1C1917]">
              <span className="text-[#D97706]">★</span>
              <span className="font-[family-name:var(--font-mono)]">{product.rating.toFixed(1)}</span>
            </div>
          </div>

          <h3
            className="text-sm font-bold text-[#1C1917] leading-snug line-clamp-2 min-h-[2.6em] cursor-pointer hover:text-[#D97706] transition-colors"
            onClick={() => onSelect(product)}
          >
            {product.name}
          </h3>

          <p className="mt-1.5 text-xs text-[#57534E] leading-relaxed line-clamp-2 min-h-[2.8em]">
            {product.description || 'Tahu Sumedang asli renyah goreng dadakan khas Priangan.'}
          </p>
        </div>

        {/* Price & Stock Row — 10/10 hierarchy */}
        <div className="mt-4 pt-3 border-t border-[#F0EDE8] flex items-end justify-between gap-3 shrink-0">
          <div className="min-w-0">
            <span className="block text-[15px] font-extrabold text-[#1C1917] font-[family-name:var(--font-mono)] truncate tracking-tight">
              {formatRupiah(product.price)}
            </span>
            {product.originalPrice ? (
              <span className="block text-[11px] text-[#A8A29E] line-through font-[family-name:var(--font-mono)]">
                {formatRupiah(product.originalPrice)}
              </span>
            ) : (
              <span className="block text-[11px] invisible select-none" aria-hidden>
                —
              </span>
            )}
          </div>

          <span className="text-[10px] font-bold font-[family-name:var(--font-mono)] text-[#1C1917]">
            {product.stock > 0 ? `Stok: ${product.stock}` : 'Habis'}
          </span>
        </div>
      </div>
    </div>
  )
}
