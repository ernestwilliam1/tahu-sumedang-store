'use client'

import { useRef, useEffect, useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface NavbarProps {
  cartCount: number
  onOpenCart: () => void
  session: { name: string; role: string } | null
}

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('')
}

const ROLE_DASH_HREF: Record<string, string> = {
  SUPERADMIN: '/dashboard/owner',
  OWNER: '/dashboard/owner',
  ADMIN: '/dashboard/admin',
  STAFF: '/dashboard/admin',
  SUPPLIER: '/dashboard/supplier',
  FINANCE: '/dashboard/finance',
  CUSTOMER: '/profile',
}

export function Navbar({ cartCount, onOpenCart, session }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const [badgeBump, setBadgeBump] = useState(false)
  const prevCount = useRef(cartCount)

  useEffect(() => {
    if (cartCount > prevCount.current) {
      setBadgeBump(true)
      const t = setTimeout(() => setBadgeBump(false), 450)
      return () => clearTimeout(t)
    }
    prevCount.current = cartCount
  }, [cartCount])

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])

  const firstName = session?.name.split(' ')[0] ?? ''

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
        scrolled
          ? 'py-2.5 sm:py-3 liquid-glass-scrolled'
          : 'py-3.5 sm:py-4 liquid-glass'
      )}
    >
      <div className="max-w-[1260px] mx-auto px-6 sm:px-8 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <img
            src={encodeURI('/images/logo_tahu_sumedang.png')}
            alt="Tahu Sumedang"
            className="h-10 w-auto object-contain transition-transform group-hover:scale-[1.02]"
            draggable={false}
          />
        </Link>

        {/* Center Links */}
        <div className="hidden md:flex items-center gap-1 lg:gap-1.5 px-3 py-1 rounded-full liquid-glass-pill">
          <Link
            href="/katalog"
            className="px-3 py-1.5 text-xs lg:text-sm font-medium text-[#57534E] hover:text-[#D97706] hover:bg-white/60 rounded-full transition-all"
          >
            Katalog Menu
          </Link>
          <Link
            href="/tentang"
            className="px-3 py-1.5 text-xs lg:text-sm font-medium text-[#57534E] hover:text-[#D97706] hover:bg-white/60 rounded-full transition-all"
          >
            Tentang Kami
          </Link>
          <Link
            href="/faq"
            className="px-3 py-1.5 text-xs lg:text-sm font-medium text-[#57534E] hover:text-[#D97706] hover:bg-white/60 rounded-full transition-all"
          >
            FAQ
          </Link>
          <Link
            href="/kontak"
            className="px-3 py-1.5 text-xs lg:text-sm font-medium text-[#57534E] hover:text-[#D97706] hover:bg-white/60 rounded-full transition-all"
          >
            Kontak
          </Link>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          {/* Cart Trigger */}
          <button
            onClick={onOpenCart}
            className={cn(
              "relative flex items-center gap-2 px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-medium text-[#1C1917] rounded-full active:scale-95 transition-all duration-200 group liquid-glass-pill",
              badgeBump && "border-[#FDBA74] shadow-[0_2px_12px_rgba(217,119,6,0.2)]"
            )}
            id="cart-button"
            aria-label="Keranjang Belanja"
          >
            <svg
              className={cn(
                "w-4 h-4 text-[#1C1917] transition-transform duration-300 group-hover:scale-110",
                badgeBump && "scale-125 -rotate-12 text-[#D97706]"
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={1.75}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
              />
            </svg>
            <span className="hidden sm:inline">Keranjang</span>
            {cartCount > 0 && (
              <span
                className={cn(
                  "min-w-5 h-5 px-1.5 rounded-full bg-[#D97706] text-white text-[11px] font-bold flex items-center justify-center shadow-xs transition-transform duration-200",
                  badgeBump && "animate-pop-badge scale-125 bg-[#EA8A1A]"
                )}
              >
                {cartCount}
              </span>
            )}
          </button>

          {!session ? (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-[#1C1917] hover:text-[#D97706] transition"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 bg-[#D97706] hover:bg-[#B45309] text-white text-xs sm:text-sm font-bold rounded-full shadow-[0_2px_8px_rgba(217,119,6,0.25)] transition active:scale-95"
              >
                Daftar
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href={ROLE_DASH_HREF[session.role] ?? '/profile'}
                className="flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full liquid-glass-pill transition active:scale-95"
              >
                <span className="w-6 h-6 rounded-full bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] text-[10px] font-bold flex items-center justify-center shrink-0">
                  {initials(session.name)}
                </span>
                <span className="hidden sm:inline text-xs font-semibold text-[#1C1917]">
                  {firstName}
                </span>
              </Link>

              <button
                type="button"
                onClick={async () => {
                  const { logoutAction } = await import('@/lib/authActions')
                  await logoutAction()
                  window.location.href = '/'
                }}
                className="px-2.5 py-1.5 text-xs text-[#78716C] hover:text-[#1C1917] font-medium transition"
                title="Keluar dari akun"
              >
                Keluar
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
