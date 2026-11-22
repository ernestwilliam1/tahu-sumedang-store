'use client'

import { useEffect, useState } from 'react'

const SLIDES = [
  {
    image: '/images/Tahu Sumedang Besek Tradisional.jpg',
    title: 'Tahu Sumedang Besek Tradisional',
    category: 'Menu Utama',
    desc: 'Tahu tradisional dengan tekstur renyah di luar dan lembut di dalam, dikemas higienis dengan standar mutu terjaga.',
  },
  {
    image: '/images/Tahu Super Renyah Besek Puas.jpg',
    title: 'Tahu Super Renyah',
    category: 'Varian Pilihan',
    desc: 'Diproduksi menggunakan bahan baku kedelai pilihan dan dimasak pada suhu presisi untuk kerenyahan optimal.',
  },
  {
    image: '/images/Tahu Walik Krispy Sambal Petis.jpg',
    title: 'Tahu Walik Krispy',
    category: 'Varian Spesial',
    desc: 'Olahan tahu krispy bertekstur khas dengan isian gurih padat, disajikan lengkap dengan sambal petis tradisional.',
  },
  {
    image: '/images/Tahu Gejrot Pedas Segar.jpg',
    title: 'Tahu Gejrot Tradisional',
    category: 'Kuliner Nusantara',
    desc: 'Perpaduan tahu lembut dengan kuah rempah gula aren, asam jawa, dan cabai rawit segar dengan racikan seimbang.',
  },
]

/** Panel showcase menu untuk halaman autentikasi (login & register). */
export function AuthShowcase() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setActive((p) => (p + 1) % SLIDES.length), 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="relative h-full w-full hidden lg:flex flex-col justify-between p-6 sm:p-7 overflow-hidden bg-[#1C1917]">
      {SLIDES.map((slide, i) => (
        <div
          key={slide.title}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            i === active ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
          }`}
        >
          <img
            src={encodeURI(slide.image)}
            alt={slide.title}
            className="w-full h-full object-cover object-center"
            draggable={false}
          />
        </div>
      ))}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/30" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/20" />

      <div className="relative z-10 flex items-center justify-end w-full">
        <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-white/10">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Slide ${i + 1}`}
              className={`transition-all rounded-full cursor-pointer ${
                i === active ? 'w-4 h-1.5 bg-[#D97706]' : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 mt-auto">
        <div className="bg-black/50 backdrop-blur-md border border-white/15 rounded-2xl p-4 sm:p-5 space-y-1.5 shadow-lg">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#FBBF24]">
            {SLIDES[active].category}
          </span>
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
            {SLIDES[active].title}
          </h2>
          <p className="text-xs text-neutral-200 leading-relaxed font-normal pt-0.5">
            {SLIDES[active].desc}
          </p>
        </div>
      </div>
    </div>
  )
}
