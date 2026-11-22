'use client'

import Link from 'next/link'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer id="tentang" className="relative border-t border-[#EDE9E3] bg-[#FDFBF7] text-[#1C1917] mt-12 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: 'linear-gradient(90deg,#D97706,#EA8A1A,#C45A2E)' }} aria-hidden />
      <div className="max-w-[var(--content-max)] mx-auto px-6 sm:px-8 py-16 sm:py-20">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8">
          {/* Brand Col */}
          <div className="md:col-span-5 min-w-0">
            <div className="flex items-center gap-3 mb-4">
              <img
                src={encodeURI('/images/logo_tahu_sumedang.png')}
                alt="Tahu Sumedang"
                className="h-10 w-auto object-contain"
                draggable={false}
              />
            </div>
            <p className="text-sm text-[#57534E] leading-relaxed max-w-sm">
              Warisan kuliner Priangan asli sejak turun-temurun. Digoreng dadakan dari kedelai pilihan dan minyak higienis berkualitas, menghasilkan sensasi renyah di luar dan lembut kopong di dalam.
            </p>

            {/* Micro stats */}
            <div className="mt-8 flex items-center gap-8">
              {[
                { value: '2.400+', label: 'Pesanan / bulan' },
                { value: '4.9 ★', label: 'Rating Google' },
              ].map((s) => (
                <div key={s.label}>
                  <span className="block text-base font-extrabold text-[#1C1917] font-[family-name:var(--font-mono)]">
                    {s.value}
                  </span>
                  <span className="block text-[11px] text-[#78716C] mt-0.5 font-medium">
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Menu links */}
          <div className="md:col-span-3">
            <h4 className="text-xs font-bold text-[#1C1917] tracking-[0.14em] uppercase mb-4">
              Kategori Menu
            </h4>
            <ul className="space-y-2.5">
              {['Paket Besek', 'Tahu Mercon', 'Frozen Pack', 'Sambal Kecap & Rawit', 'Paket Hampers'].map((item) => (
                <li key={item}>
                  <a
                    href="#katalog"
                    className="text-sm text-[#57534E] hover:text-[#D97706] transition-colors font-medium"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Store Location and Contacts */}
          <div className="md:col-span-4">
            <h4 className="text-xs font-bold text-[#1C1917] tracking-[0.14em] uppercase mb-4">
              Gerai & Layanan Pesan Antar
            </h4>
            <ul className="space-y-3 text-sm text-[#57534E]">
              <li className="flex gap-2.5 items-start">
                <span className="text-[#D97706] shrink-0">📍</span>
                <span>Jl. Raya Bogor No.KM. 28, RT.5/RW.1, Pekayon, Kec. Ps. Rebo, Kota Jakarta Timur, DKI Jakarta 13710</span>
              </li>
              <li className="flex gap-2.5 items-center">
                <span className="text-[#D97706] shrink-0">📱</span>
                <a href="tel:+6285889191659" className="hover:text-[#D97706] font-semibold transition">
                  +62 858-8919-1659 (WhatsApp / Telp)
                </a>
              </li>
              <li className="flex gap-2.5 items-center">
                <span className="text-[#D97706] shrink-0">🕐</span>
                <span>Buka setiap hari 06:00 – 21:00 WIB</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-[#E5E2DC] my-10" />

        {/* SEO quick links */}
        <nav aria-label="Navigasi cepat" className="flex flex-wrap gap-x-3 gap-y-2 text-xs font-semibold text-[#78716C] mb-4">
          <Link href="/" className="hover:text-[#D97706] transition-colors">Beranda</Link>
          <span className="text-[#E5E2DC]">·</span>
          <Link href="/katalog" className="hover:text-[#D97706] transition-colors">Katalog</Link>
          <span className="text-[#E5E2DC]">·</span>
          <Link href="/tentang" className="hover:text-[#D97706] transition-colors">Tentang Kami</Link>
          <span className="text-[#E5E2DC]">·</span>
          <Link href="/kontak" className="hover:text-[#D97706] transition-colors">Kontak</Link>
          <span className="text-[#E5E2DC]">·</span>
          <Link href="/faq" className="hover:text-[#D97706] transition-colors">FAQ</Link>
        </nav>

        {/* Legal links */}
        <nav aria-label="Informasi legal" className="flex flex-wrap gap-x-3 gap-y-2 text-xs font-semibold text-[#78716C] mb-6">
          <Link href="/syarat-ketentuan" className="hover:text-[#D97706] transition-colors">Syarat &amp; Ketentuan</Link>
          <span className="text-[#E5E2DC]">·</span>
          <Link href="/kebijakan-privasi" className="hover:text-[#D97706] transition-colors">Kebijakan Privasi</Link>
          <span className="text-[#E5E2DC]">·</span>
          <Link href="/sitemap.xml" className="hover:text-[#D97706] transition-colors">Sitemap</Link>
        </nav>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#78716C]">
          <span>
            © {year} Tahu Sumedang. Hak Cipta Dilindungi Undang-Undang.
          </span>
          <span className="font-medium">
            Artisanal Culinary Heritage · Rasa Asli Priangan
          </span>
        </div>
      </div>
    </footer>
  )
}
