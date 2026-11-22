'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Product, CartItem } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Navbar } from './Navbar'
import { HeroParallax } from './ui/hero-parallax'
import { getProductImageUrl } from '@/lib/productImage'
import { ProductCard } from './ProductCard'
import { ProductDetail } from './ProductDetail'
import { CartDrawer } from './CartDrawer'
import { CheckoutModal } from './CheckoutModal'
import { OrderSuccess } from './OrderSuccess'
import { Footer } from './Footer'
import type { UserProfileData } from '@/lib/actions'

interface StoreClientProps {
  products: Product[]
  session: { name: string; role: string } | null
  userProfile?: UserProfileData | null
  initialSelectedProduct?: Product | null
}

const CATEGORIES = [
  { id: 'all', label: 'Semua Menu' },
  { id: 'Paket Besek', label: 'Paket Besek' },
  { id: 'Tahu Mercon', label: 'Tahu Mercon' },
  { id: 'Tahu Goreng', label: 'Goreng Dadakan' },
  { id: 'Frozen', label: 'Frozen Pack' },
  { id: 'Pelengkap', label: 'Bumbu & Sambal' },
  { id: 'Hampers', label: 'Paket Oleh-Oleh' },
]

export function StoreClient({ products, session, userProfile, initialSelectedProduct }: StoreClientProps) {
  const router = useRouter()
  const [category, setCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [wishlist, setWishlist] = useState<Set<number>>(new Set())
  // Hydrate wishlist only on client after mount — avoids SSR/client mismatch
  useEffect(() => {
    try {
      const raw = localStorage.getItem('ts_wishlist')
      if (raw) setWishlist(new Set(JSON.parse(raw)))
    } catch {}
  }, [])
  const toggleWishlist = (id: number) => {
    setWishlist(prev => {
      const n = new Set(prev)
      if (n.has(id)) n.delete(id); else n.add(id)
      try { localStorage.setItem('ts_wishlist', JSON.stringify([...n])) } catch {}
      return n
    })
  }
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'popular'>('default')
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(initialSelectedProduct ?? null)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [successOrder, setSuccessOrder] = useState<{
    orderNumber: string
    total: number
    paymentMethod: string
    vaNumber?: string
    qrisPayload?: string
  } | null>(null)
  const [toast, setToast] = useState<{ msg: string; type?: 'info' | 'error' | 'success' } | null>(null)

  const showToast = (msg: string, type: 'info' | 'error' | 'success' = 'info') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const redirectToLoginWithNotice = (actionLabel = 'berbelanja') => {
    showToast(`Silakan masuk ke akun Anda terlebih dahulu untuk ${actionLabel}. Mengalihkan...`, 'info')
    const currentPath = typeof window !== 'undefined'
      ? window.location.pathname + window.location.search
      : '/#katalog'
    const returnUrl = encodeURIComponent(currentPath || '/#katalog')
    setTimeout(() => {
      router.push(`/login?callbackUrl=${returnUrl}`)
    }, 850)
  }

  const purchaseGuard = (actionLabel = 'menambahkan produk ke keranjang') => {
    if (!session) {
      redirectToLoginWithNotice(actionLabel)
      return false
    }
    if (session.role !== 'CUSTOMER') {
      showToast('Akses dibatasi: akun operasional (Admin, Finance, Owner, Supplier) tidak dapat melakukan pembelian. Silakan gunakan akun Pelanggan.', 'error')
      return false
    }
    return true
  }

  const cartCount = useMemo(() => cart.reduce((s, i) => s + i.quantity, 0), [cart])

  const parallaxProducts = useMemo(() => {
    const mapped = products.map((p) => ({
      title: p.name,
      link: '#katalog',
      thumbnail: getProductImageUrl(p) || '/images/Tahu Sumedang Besek Tradisional.jpg',
    }))
    // Duplicate to fill 15 slots for 3×5 parallax rows without mock data
    const filled: typeof mapped = []
    while (filled.length < 15) filled.push(...mapped.slice(0, Math.min(mapped.length, 15 - filled.length)))
    return filled.slice(0, 15)
  }, [products])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return products
      .filter((p) => category === 'all' || p.category === category)
      .filter((p) => !q || p.name.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q) || p.category.toLowerCase().includes(q))
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price
        if (sortBy === 'price-desc') return b.price - a.price
        if (sortBy === 'popular') return b.soldCount - a.soldCount
        return 0
      })
  }, [products, category, sortBy, search])

  const addToCart = (product: Product, qty = 1) => {
    if (!purchaseGuard('menambahkan produk ke keranjang')) return
    if (product.stock <= 0) {
      showToast(`Stok ${product.name} sedang habis sementara`, 'error')
      return
    }
    const currentInCart = cart.find((i) => i.productId === product.id)?.quantity || 0
    if (currentInCart + qty > product.stock) {
      showToast(`Maksimal ${product.stock} pcs: stok gudang terbatas`, 'error')
      return
    }
    setCart((prev) => {
      const idx = prev.findIndex((i) => i.productId === product.id)
      if (idx > -1) {
        const u = [...prev]
        u[idx] = { ...u[idx], quantity: u[idx].quantity + qty }
        return u
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: qty,
          image: product.image,
        },
      ]
    })
    showToast(`Berhasil: ${product.name} ditambahkan ke keranjang`, 'success')
  }

  const buyNow = (product: Product, qty = 1) => {
    if (!purchaseGuard('melakukan pembelian langsung')) return
    if (product.stock <= 0) {
      showToast(`Stok ${product.name} sedang habis sementara`, 'error')
      return
    }
    const currentInCart = cart.find((i) => i.productId === product.id)?.quantity || 0
    if (currentInCart + qty > product.stock) {
      showToast(`Maksimal ${product.stock} pcs: stok gudang terbatas`, 'error')
      return
    }
    setCart((prev) => {
      const idx = prev.findIndex((i) => i.productId === product.id)
      if (idx > -1) {
        const u = [...prev]
        u[idx] = { ...u[idx], quantity: u[idx].quantity + qty }
        return u
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: qty,
          image: product.image,
        },
      ]
    })
    setSelectedProduct(null)
    setIsCheckoutOpen(true)
  }

  const handleOpenCart = () => {
    if (!session) {
      redirectToLoginWithNotice('melihat keranjang belanja')
      return
    }
    setIsCartOpen(true)
  }

  const handleOpenCheckout = () => {
    if (!session) {
      redirectToLoginWithNotice('melakukan checkout pesanan')
      return
    }
    setIsCartOpen(false)
    setIsCheckoutOpen(true)
  }

  const updateQty = (productId: number, delta: number) => {
    const prod = products.find((p) => p.id === productId)
    setCart((prev) =>
      prev
        .map((it) => {
          if (it.productId !== productId) return it
          const nextQty = it.quantity + delta
          if (nextQty <= 0) return null
          if (prod && nextQty > prod.stock) {
            showToast(`Maksimal ${prod.stock} pcs: stok gudang terbatas`, 'error')
            return { ...it, quantity: prod.stock }
          }
          return { ...it, quantity: nextQty }
        })
        .filter(Boolean) as CartItem[]
    )
  }

  const removeItem = (productId: number) =>
    setCart((prev) => prev.filter((i) => i.productId !== productId))

  const scrollToCatalog = () =>
    document.getElementById('katalog')?.scrollIntoView({ behavior: 'smooth' })

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#1C1917]">

      <Navbar cartCount={cartCount} onOpenCart={handleOpenCart} session={session} />

      <main className="flex-1">
        <HeroParallax products={parallaxProducts} />

        <section
          id="katalog"
          className="max-w-[var(--content-max)] mx-auto px-6 sm:px-8 py-16 sm:py-20 lg:py-24 aura-amber rounded-[28px]"
        >
          {/* Section Header */}
          <div className="mb-10 sm:mb-12 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1C1917] leading-none">
              Menu Tahu Sumedang <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg,#D97706,#C45A2E)' }}>Hangat</span>
            </h2>
            <p className="mt-3 text-sm sm:text-[14px] text-[#57534E] leading-relaxed max-w-xl">
              Harga transparan, stok real-time — pesan antar atau ambil di gerai, goreng dadakan setiap hari.
            </p>
            </div>
            <div className="hidden lg:flex items-center gap-2 text-[11px] font-semibold text-[#78716C] shrink-0">
              <span className="w-2 h-2 rounded-full bg-[#059669] shadow-sm" /> Buka 06:00 – 21:00 WIB
            </div>
          </div>

          {/* Filter & Sorting Bar — 10/10 artisanal */}
          <div className="flex flex-col gap-4 mb-8 sm:mb-10 p-4 sm:p-5 bg-white border border-[#EDE9E3] rounded-[18px] shadow-[0_2px_12px_rgba(28,25,23,0.04)]">
            {/* Search */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 max-w-xl group/input">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A8A29E] group-focus-within/input:text-[#D97706] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" /></svg>
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari tahu, kategori, atau deskripsi…" className="w-full h-[42px] pl-10 pr-10 bg-[#FAF9F6] border border-[#EDE9E3] rounded-[12px] text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:bg-white focus:border-[#D97706] focus:ring-[3px] focus:ring-[#D97706]/10 focus:outline-none transition-all" />
                {search && <button onClick={() => setSearch('')} aria-label="Hapus pencarian" className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white border border-[#EDE9E3] text-[#78716C] hover:text-[#1C1917] hover:border-[#D6D3D1] text-xs flex items-center justify-center transition">✕</button>}
              </div>
              {wishlist.size > 0 && <span className="h-[42px] px-4 inline-flex items-center gap-1.5 rounded-full text-xs font-bold self-start border shadow-sm" style={{ background: 'linear-gradient(135deg,#FFF7ED,#FFEDD5)', borderColor: '#FDBA74', color: '#9A3412' }}>♥ {wishlist.size} favorit</span>}
            </div>
            <div className="h-px bg-[#F0EDE8]" />
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Category Pills */}
            <div className="flex items-center gap-2 flex-wrap">
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat.id
                return (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`h-9 px-4.5 text-xs font-bold tracking-wide rounded-full border transition-all duration-200 active:scale-95 ${
                      isSelected
                        ? 'text-white border-transparent shadow-[0_4px_14px_rgba(217,119,6,0.28)]'
                        : 'bg-white text-[#57534E] border-[#EDE9E3] hover:border-[#FDBA74] hover:text-[#9A3412] hover:bg-[#FFFBF5]'
                    }`}
                    style={isSelected ? { background: 'linear-gradient(135deg,#D97706,#EA8A1A)' } : undefined}
                  >
                    {cat.label}
                  </button>
                )
              })}
            </div>

            {/* Sorting Dropdown */}
            <div className="flex items-center gap-2 self-start lg:self-auto shrink-0">
              <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-[0.1em]">
                Urutkan
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="h-9 pl-3 pr-8 bg-[#FAF9F6] border border-[#EDE9E3] rounded-full text-xs font-semibold text-[#1C1917] hover:bg-white hover:border-[#D6D3D1] focus:bg-white focus:border-[#D97706] focus:outline-none focus:ring-2 focus:ring-[#D97706]/10 transition cursor-pointer appearance-none"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2357534E' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}
              >
                <option value="default">Rekomendasi</option>
                <option value="popular">Paling Populer</option>
                <option value="price-asc">Harga: Terendah</option>
                <option value="price-desc">Harga: Tertinggi</option>
              </select>
            </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex items-center justify-between mb-4 text-xs text-[#78716C]">
            <span>{filtered.length} produk • {search ? `hasil "${search}"` : CATEGORIES.find(c=>c.id===category)?.label}</span>
            <nav className="hidden sm:flex items-center gap-1.5 text-[11px]"><a href="/" className="hover:text-[#1C1917]">Beranda</a><span>/</span><span className="font-bold text-[#1C1917]">Katalog</span></nav>
          </div>
          {filtered.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-base font-semibold text-[#78716C]">
                Belum ada produk di kategori ini.
              </p>
              <button
                onClick={() => setCategory('all')}
                className="mt-3 text-xs font-bold text-[#D97706] hover:underline"
              >
                Lihat semua menu
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-7">
              {filtered.map((product, i) => (
                <div key={product.id} className="h-full min-w-0">
                  <ProductCard
                    product={product}
                    index={i}
                    onSelect={setSelectedProduct}
                    onAddToCart={(p) => addToCart(p)}
                    isWishlisted={wishlist.has(product.id)}
                    onToggleWishlist={toggleWishlist}
                  />
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />

      {/* Modals & Overlays with Fixed Stacking Context */}
      <ProductDetail
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={(p, qty) => {
          addToCart(p, qty)
          setSelectedProduct(null)
        }}
        onBuyNow={(p, qty) => buyNow(p, qty)}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQty={updateQty}
        onRemove={removeItem}
        onClear={() => setCart([])}
        onCheckout={handleOpenCheckout}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        initialProfile={userProfile}
        onSuccess={(orderNumber, paymentMethod, vaNumber, qrisPayload, totalAmount) => {
          const fallback = cart.reduce((s, i) => s + i.price * i.quantity, 0)
          setIsCheckoutOpen(false)
          setCart([])
          setSuccessOrder({ orderNumber, total: totalAmount ?? fallback, paymentMethod, vaNumber, qrisPayload })
        }}
      />

      {successOrder && (
        <OrderSuccess
          orderNumber={successOrder.orderNumber}
          totalAmount={successOrder.total}
          paymentMethod={successOrder.paymentMethod}
          vaNumber={successOrder.vaNumber}
          qrisPayload={successOrder.qrisPayload}
          onClose={() => setSuccessOrder(null)}
        />
      )}

      {/* Interactive Toast Notification with Smooth Motion */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-[130] max-w-sm sm:max-w-md w-[calc(100vw-3rem)] pointer-events-auto"
        >
          <div
            className={cn(
              "flex items-center gap-3 p-4 rounded-2xl border shadow-xl backdrop-blur-xl animate-toast-enter transition-all",
              toast.type === 'success'
                ? "bg-white/95 border-[#A7F3D0] text-[#065F46] shadow-[0_8px_30px_rgba(5,150,105,0.18)]"
                : toast.type === 'error'
                ? "bg-white/95 border-[#FECACA] text-[#991B1B] shadow-[0_8px_30px_rgba(220,38,38,0.15)]"
                : "bg-white/95 border-[#FDE68A] text-[#92400E] shadow-[0_8px_30px_rgba(217,119,6,0.15)]"
            )}
          >
            <div
              className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold",
                toast.type === 'success'
                  ? "bg-[#D1FAE5] text-[#059669]"
                  : toast.type === 'error'
                  ? "bg-[#FEE2E2] text-[#DC2626]"
                  : "bg-[#FEF3C7] text-[#D97706]"
              )}
            >
              {toast.type === 'success' ? (
                <svg className="w-5 h-5 animate-pop-badge" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              ) : toast.type === 'error' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-semibold leading-snug line-clamp-2">
                {toast.msg}
              </p>
            </div>
            <button
              onClick={() => setToast(null)}
              className="w-7 h-7 rounded-full flex items-center justify-center text-[#78716C] hover:text-[#1C1917] hover:bg-black/5 transition shrink-0 cursor-pointer"
              aria-label="Tutup notifikasi"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
