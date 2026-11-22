import type { Metadata } from 'next'
import AboutUsSection from '@/components/ui/about-us-section'
import { PageShell, SectionHeading, Body, Bullets } from '@/components/PageShell'
import { getSession } from '@/lib/auth'

export const metadata: Metadata = {
  title: 'Tentang Kami',
  description:
    'Kisah warisan kuliner Tahu Sumedang: visi, misi, dan proses pembuatan tahu goreng dadakan khas Priangan dari kedelai pilihan.',
  alternates: { canonical: '/tentang' },
}

const VALUES = [
  'Kedelai pilihan non-GMO tanpa bahan pengawet, diolah segar setiap pagi di dapur gerai.',
  'Minyak goreng diganti berkala — tidak pernah dipakai berulang hingga menghitam.',
  'Bumbu dan sambal kecap diracik harian mengikuti resep keluarga turun-temurun.',
  'Tanpa MSG berlebih, tanpa pewarna sintetis, tanpa pengawet kimia.',
]

const MILESTONES = [
  { year: '1978', text: 'Gerai pertama dibuka di Sumedang dengan satu wajan tembaga dan resep keluarga.' },
  { year: '1995', text: 'Generasi kedua memperluas distribusi ke Bandung dan sekitarnya.' },
  { year: '2012', text: 'Standar higienitas dapur ditingkatkan mengikuti sertifikasi pangan rumah tangga.' },
  { year: '2024', text: 'Kanal pesan-antar digital diluncurkan agar tahu sampai dalam keadaan hangat.' },
]

export default async function TentangPage() {
  const s = await getSession()
  return (
    <PageShell
      session={s ? { name: s.name, role: s.role } : null}
      eyebrow="Tentang Kami"
      title="Warisan Tahu Sumedang Sejak Turun-Temurun"
      description="Kami menjaga satu resep, satu tekstur, dan satu janji: renyah di luar, lembut kopong di dalam, disajikan hangat setiap saat."
    >
      <div className="-mx-6 sm:-mx-8 border-y border-[#E5E2DC]">
        <AboutUsSection />
      </div>

      <div className="space-y-10">
        {/* Visi & Misi */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            className="bg-white border border-[#E5E2DC] rounded-xl p-6"
            style={{ boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03), 0 2px 4px -2px rgba(0,0,0,0.03)' }}
          >
            <h2 className="text-[13px] font-semibold tracking-[0.12em] uppercase text-[#78716C]">
              Visi
            </h2>
            <p className="mt-2.5 text-[15px] text-[#1C1917] leading-[1.65]">
              Menjadi rujukan tahu goreng dadakan khas Priangan yang paling dipercaya karena
              konsistensi rasa, kejujuran bahan, dan pelayanan yang hangat.
            </p>
          </div>

          <div
            className="bg-[#F3F1ED] border border-[#E7E5E4] rounded-xl p-6"
          >
            <h2 className="text-[13px] font-semibold tracking-[0.12em] uppercase text-[#78716C]">
              Misi
            </h2>
            <p className="mt-2.5 text-[15px] text-[#1C1917] leading-[1.65]">
              Menyajikan produk segar tanpa pengawet dengan standar higienitas yang dapat diaudit,
              bekerja bersama mitra lokal, dan menjaga harga tetap wajar bagi keluarga.
            </p>
          </div>
        </div>

        {/* Cerita */}
        <section className="space-y-3">
          <SectionHeading>Cerita Kami</SectionHeading>
          <Body>
            Tahu Sumedang lahir dari dapur sederhana di tanah Priangan. Berawal dari satu wajan
            tembaga dan resep keluarga yang diwariskan lisan, kami mempertahankan cara lama yang
            membuat tahu ini berbeda: perendaman kedelai yang cukup waktu, penggumpalan alami, lalu
            penggorengan dadakan hanya ketika pesanan masuk.
          </Body>
          <Body>
            Prinsip itu tidak berubah meski kini kami melayani ribuan pesanan setiap bulan. Tahu yang
            digoreng lalu didiamkan akan kehilangan renyahnya — karena itu kami menolak menggoreng
            dalam jumlah besar di awal. Setiap besek disiapkan ketika Anda memesan.
          </Body>
        </section>

        {/* Komitmen */}
        <section className="space-y-3">
          <SectionHeading>Komitmen Bahan &amp; Higienitas</SectionHeading>
          <Bullets items={VALUES} />
        </section>

        {/* Perjalanan */}
        <section className="space-y-4">
          <SectionHeading>Perjalanan Kami</SectionHeading>
          <ol className="border-l border-[#E5E2DC] pl-5 space-y-5">
            {MILESTONES.map((m) => (
              <li key={m.year} className="relative">
                <span className="absolute -left-[25px] top-[7px] w-2 h-2 rounded-full bg-[#D97706]" />
                <span className="block text-[13px] font-semibold text-[#78716C] tabular-nums">
                  {m.year}
                </span>
                <span className="block mt-1 text-[15px] text-[#57534E] leading-[1.65]">
                  {m.text}
                </span>
              </li>
            ))}
          </ol>
        </section>

        {/* Footer nav */}
        <div className="flex flex-wrap gap-3 pt-2">
          <a
            href="/katalog"
            className="inline-flex items-center justify-center h-11 px-6 rounded-lg bg-[#1C1917] text-white text-[15px] font-medium hover:bg-[#292524] active:bg-[#44403C] transition-colors"
          >
            Lihat Katalog Menu
          </a>
          <a
            href="/kontak"
            className="inline-flex items-center justify-center h-11 px-6 rounded-lg bg-white border border-[#E5E2DC] text-[#1C1917] text-[15px] font-medium hover:bg-[#F3F1ED] hover:border-[#D6D3D1] transition-colors"
          >
            Hubungi Kami
          </a>
        </div>
      </div>
    </PageShell>
  )
}
