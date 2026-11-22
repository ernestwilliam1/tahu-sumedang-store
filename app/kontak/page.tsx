import type { Metadata } from 'next'
import { PageShell } from '@/components/PageShell'
import { ContactForm } from '@/components/ContactForm'
import { getSession } from '@/lib/auth'

export const metadata: Metadata = {
  title: 'Hubungi Kami',
  description:
    'Kontak Tahu Sumedang: alamat gerai, jam operasional, WhatsApp pemesanan, dan formulir pertanyaan pelanggan.',
  alternates: { canonical: '/kontak' },
}

const INFO = [
  {
    label: 'Alamat Gerai',
    value: 'Jl. Raya Bogor No.KM. 28, RT.5/RW.1, Pekayon, Kec. Ps. Rebo, Kota Jakarta Timur, DKI Jakarta 13710',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    ),
  },
  {
    label: 'Telepon / WhatsApp',
    value: '+62 858-8919-1659',
    href: 'https://wa.me/6285889191659',
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />,
  },
  {
    label: 'Jam Operasional',
    value: 'Setiap hari 06:00 – 21:00 WIB (termasuk hari libur nasional)',
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />,
  },
  {
    label: 'Email Korespondensi',
    value: 'halo@tahusumedang.example.com',
    href: 'mailto:halo@tahusumedang.example.com',
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />,
  },
]

export default async function KontakPage() {
  const s = await getSession()
  return (
    <PageShell
      session={s ? { name: s.name, role: s.role } : null}
      eyebrow="Kontak"
      title="Hubungi Tahu Sumedang"
      description="Ada pertanyaan soal menu, pengiriman, atau pesanan yang sedang berjalan? Tim kami siap membantu pada jam operasional gerai."
    >
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        {/* Info Column */}
        <div className="lg:col-span-2 space-y-3">
          {INFO.map((item) => {
            const inner = (
              <>
                <div className="w-9 h-9 rounded-xl bg-[#FEF3C7] border border-[#FDE68A] text-[#92400E] flex items-center justify-center shrink-0">
                  <svg className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.9}>
                    {item.icon}
                  </svg>
                </div>
                <div className="min-w-0">
                  <span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[#78716C]">
                    {item.label}
                  </span>
                  <span className={`block text-sm font-semibold leading-relaxed mt-0.5 ${item.href ? 'text-[#D97706]' : 'text-[#1C1917]'}`}>
                    {item.value}
                  </span>
                </div>
              </>
            )

            return item.href ? (
              <a
                key={item.label}
                href={item.href}
                target={item.href.startsWith('http') ? '_blank' : undefined}
                rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="flex gap-3 p-4 bg-white border border-[#E5E2DC] rounded-2xl shadow-[0_2px_8px_rgba(28,25,23,0.04)] hover:border-[#FDBA74] hover:shadow-[0_4px_16px_rgba(28,25,23,0.06)] transition-all"
              >
                {inner}
              </a>
            ) : (
              <div
                key={item.label}
                className="flex gap-3 p-4 bg-white border border-[#E5E2DC] rounded-2xl shadow-[0_2px_8px_rgba(28,25,23,0.04)]"
              >
                {inner}
              </div>
            )
          })}

          {/* Map */}
          <div className="bg-white border border-[#E5E2DC] rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(28,25,23,0.04)]">
            <iframe
              title="Peta lokasi gerai Tahu Sumedang"
              src="https://www.openstreetmap.org/export/embed.html?bbox=106.86%2C-6.34%2C106.89%2C-6.31&amp;layer=mapnik"
              className="w-full h-[220px] border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <div className="px-4 py-3 border-t border-[#E5E2DC] flex items-center justify-between gap-2">
              <span className="text-[11px] text-[#78716C]">Pekayon, Pasar Rebo, Jakarta Timur</span>
              <a
                href="https://www.google.com/maps/search/?api=1&query=Jl.+Raya+Bogor+KM+28+Pekayon+Pasar+Rebo+Jakarta+Timur"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-bold text-[#D97706] hover:underline shrink-0"
              >
                Buka Maps →
              </a>
            </div>
          </div>
        </div>

        {/* Form Column */}
        <div className="lg:col-span-3 bg-white border border-[#E5E2DC] rounded-2xl shadow-[0_2px_8px_rgba(28,25,23,0.04)] p-6 sm:p-8">
          <h2 className="text-base font-extrabold text-[#1C1917]">Kirim Pesan</h2>
          <p className="text-xs text-[#78716C] mt-1 mb-5 leading-relaxed">
            Isi formulir di bawah ini. Kami akan membalas melalui WhatsApp pada jam operasional.
          </p>
          <ContactForm />
        </div>
      </div>
    </PageShell>
  )
}

