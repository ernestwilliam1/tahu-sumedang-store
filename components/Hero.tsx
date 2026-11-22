'use client'

import { useRef, useEffect } from 'react'

interface HeroProps {
  onScrollToCatalog: () => void
}

export function Hero({ onScrollToCatalog }: HeroProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const subRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    import('gsap')
      .then(({ gsap }) => {
        if (cancelled || !containerRef.current) return
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
        tl.from(headingRef.current, { y: 25, duration: 0.8, delay: 0.1 })
          .from(subRef.current, { y: 18, duration: 0.6 }, '-=0.45')
          .from(ctaRef.current, { y: 14, duration: 0.5 }, '-=0.35')
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section
      ref={containerRef}
      className="relative min-h-[82vh] flex items-center justify-center overflow-hidden pt-20 pb-16 bg-[#FAF9F6]"
    >
      {/* Warm Ambient Culinary Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Warm amber & cream radial glows */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-[radial-gradient(ellipse_at_center,_rgba(217,119,6,0.08),_transparent_65%)]" />
        <div className="absolute -top-24 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle,_rgba(243,241,237,0.8),_transparent_70%)]" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[400px] bg-[radial-gradient(circle,_rgba(209,250,229,0.12),_transparent_70%)]" />
      </div>

      <div className="relative z-10 max-w-[1260px] mx-auto px-6 sm:px-8 w-full">
        <div className="max-w-3xl">
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FEF3C7] border border-[#FDE68A] text-[#92400E] text-xs font-bold uppercase tracking-wider mb-6 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#D97706]" />
            <span>Warisan Kuliner Priangan Sejak Turun Temurun</span>
          </div>

          {/* Heading */}
          <h1
            ref={headingRef}
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] text-[#1C1917]"
          >
            Tahu Sumedang
            <br />
            <span className="text-[#D97706]">Goreng Dadakan.</span>
          </h1>

          {/* Subtitle */}
          <p
            ref={subRef}
            className="mt-6 text-base sm:text-lg text-[#57534E] leading-relaxed max-w-2xl font-normal"
          >
            Renyah garing di luar, lembut kopong di dalam. Diolah dari kedelai murni pilihan dan minyak berkualitas, digoreng dadakan langsung di dapur kami serta disajikan hangat dengan cabai rawit hijau segar.
          </p>

          {/* CTA Buttons */}
          <div ref={ctaRef} className="mt-8 sm:mt-10 flex items-center gap-4 flex-wrap">
            <button
              onClick={onScrollToCatalog}
              className="px-8 py-4 bg-[#D97706] hover:bg-[#B45309] text-white text-sm font-bold tracking-wide rounded-full shadow-[0_4px_16px_rgba(217,119,6,0.28)] hover:shadow-[0_6px_20px_rgba(217,119,6,0.36)] transition-all active:scale-[0.98] flex items-center gap-2"
              id="hero-cta"
            >
              <span>Pesan Sekarang</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
              </svg>
            </button>
            <a
              href="#tentang"
              className="px-7 py-4 text-sm font-bold text-[#1C1917] bg-white border border-[#E5E2DC] rounded-full hover:bg-[#F3F1ED] hover:border-[#D6D3D1] transition-all shadow-xs"
            >
              Kisah Kami
            </a>
          </div>

          {/* Key Metrics */}
          <div className="mt-14 sm:mt-16 grid grid-cols-3 gap-4 sm:gap-8 pt-8 border-t border-[#E5E2DC]/80 max-w-xl">
            {[
              { value: '2.400+', label: 'Porsi Terjual / Bln' },
              { value: '4.9 ★', label: 'Rating Kepuasan' },
              { value: '100%', label: 'Alami & Higienis' },
            ].map((stat) => (
              <div key={stat.label}>
                <span className="block text-xl sm:text-2xl font-extrabold text-[#1C1917] font-[family-name:var(--font-mono)]">
                  {stat.value}
                </span>
                <span className="block text-xs text-[#78716C] mt-0.5 font-medium">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
