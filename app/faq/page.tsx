import type { Metadata } from 'next'
import { PageShell } from '@/components/PageShell'
import { getSession } from '@/lib/auth'

export const metadata: Metadata = {
  title: 'Pertanyaan yang Sering Diajukan (FAQ)',
  description:
    'Jawaban seputar penyimpanan tahu, cara menghangatkan kembali, ongkos kirim, jangkauan pengiriman, dan metode pembayaran Tahu Sumedang.',
  alternates: { canonical: '/faq' },
}

const GROUPS: { title: string; items: { q: string; a: React.ReactNode }[] }[] = [
  {
    title: 'Produk & Penyimpanan',
    items: [
      {
        q: 'Berapa lama tahu Sumedang bertahan?',
        a: 'Tahu goreng dadakan sebaiknya dikonsumsi dalam 4–6 jam setelah digoreng agar tekstur renyahnya masih utuh. Untuk varian frozen pack, produk tahan hingga 30 hari di freezer suhu -18°C.',
      },
      {
        q: 'Bagaimana cara menyimpan tahu jika belum langsung dimakan?',
        a: 'Simpan dalam wadah tertutup di chiller (suhu 4°C) maksimal 24 jam. Jangan menyimpan dalam plastik tertutup rapat saat masih hangat — uap air akan membuat tahu berair dan kehilangan kerenyahan.',
      },
      {
        q: 'Apakah produk mengandung pengawet atau MSG?',
        a: 'Tidak. Kami tidak menggunakan pengawet kimia maupun pewarna sintetis. Pengawetan hanya mengandalkan proses pembekuan untuk varian frozen pack.',
      },
      {
        q: 'Apakah ada pilihan tanpa cabai atau ramah anak?',
        a: 'Ada. Sambal dan cabai rawit selalu dipisahkan dalam wadah tersendiri, sehingga bisa tidak disertakan. Tambahkan catatan pada kolom "Catatan Pesanan" saat checkout.',
      },
    ],
  },
  {
    title: 'Menghangatkan Kembali',
    items: [
      {
        q: 'Cara terbaik menghangatkan tahu agar renyah lagi?',
        a: 'Gunakan air fryer pada 180°C selama 3–4 menit, atau wajan kering tanpa minyak dengan api sedang selama 2 menit sambil dibolak-balik. Hindari microwave — uapnya membuat tahu lembek.',
      },
      {
        q: 'Bagaimana menghangatkan frozen pack?',
        a: 'Cairkan di chiller selama 2 jam (jangan di suhu ruang), lalu goreng dalam minyak panas 175°C selama 3–4 menit hingga keemasan. Jangan menggoreng dari kondisi beku langsung.',
      },
    ],
  },
  {
    title: 'Pengiriman',
    items: [
      {
        q: 'Berapa jangkauan pengiriman?',
        a: 'Kurir gerai melayani radius 8 km dari outlet Pekayon, Pasar Rebo. Sameday instant melayani hingga 15 km dengan estimasi 1–2 jam. Di luar radius tersebut, pesanan dapat diambil sendiri di gerai.',
      },
      {
        q: 'Berapa biaya pengiriman?',
        a: 'Ambil sendiri di gerai gratis. Kurir gerai Rp 10.000 flat, dan sameday instant Rp 20.000. Biaya final ditampilkan pada ringkasan checkout sebelum Anda membayar.',
      },
      {
        q: 'Apakah tahu masih hangat saat sampai?',
        a: 'Kami membungkus dengan kemasan berlubang ventilasi agar uap keluar dan kerenyahan bertahan. Untuk jarak dekat, pesanan digoreng setelah kurir siap berangkat.',
      },
      {
        q: 'Bisakah saya mengirim ke luar kota?',
        a: 'Bisa untuk varian frozen pack melalui ekspedisi ber-insulasi. Hubungi WhatsApp kami terlebih dahulu untuk menghitung ongkir dan memastikan jadwal pengiriman.',
      },
    ],
  },
  {
    title: 'Pembayaran & Pesanan',
    items: [
      {
        q: 'Metode pembayaran apa saja yang tersedia?',
        a: 'Kami menyediakan 3 metode pembayaran praktis: 1) Transfer Bank BCA (No Rek: 5020348994 a.n. Ernest William Imanuel Hu), 2) QRIS (otomatis kunci nominal, mendukung semua e-wallet & m-banking), dan 3) COD (Cash On Delivery / bayar tunai ke kurir).',
      },
      {
        q: 'Berapa lama batas waktu pembayaran?',
        a: 'Untuk Transfer BCA dan QRIS, batas waktu pembayaran adalah 24 jam sejak pesanan dibuat. Setelah transfer/scan QR, silakan unggah bukti screenshot pembayaran agar diverifikasi oleh tim Finance kami.',
      },
      {
        q: 'Apakah bisa membatalkan pesanan?',
        a: 'Bisa selama status belum DELIVERED atau CANCELLED. Pesanan yang sudah lunas hanya dapat dibatalkan melalui Owner atau Finance. Lihat halaman Syarat & Ketentuan untuk detailnya.',
      },
      {
        q: 'Bagaimana jika produk yang diterima tidak sesuai?',
        a: 'Ajukan retur melalui halaman Profil → Riwayat Pesanan → "Ajukan Retur", maksimal 1×24 jam setelah pesanan diterima, dengan menyertakan alasan dan foto bila memungkinkan.',
      },
    ],
  },
]

export default async function FaqPage() {
  const s = await getSession()
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: GROUPS.flatMap((g) =>
      g.items.map((it) => ({
        '@type': 'Question',
        name: it.q,
        acceptedAnswer: { '@type': 'Answer', text: typeof it.a === 'string' ? it.a : '' },
      }))
    ),
  }

  return (
    <PageShell
      session={s ? { name: s.name, role: s.role } : null}
      eyebrow="FAQ"
      title="Pertanyaan yang Sering Diajukan"
      description="Ringkasan jawaban atas pertanyaan paling umum seputar produk, penyimpanan, pengiriman, dan pembayaran."
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      <div className="space-y-8">
        {GROUPS.map((group) => (
          <section key={group.title}>
            <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-[#78716C] mb-3">
              {group.title}
            </h2>
            <div className="space-y-2.5">
              {group.items.map((item) => (
                <details
                  key={item.q}
                  className="group bg-white border border-[#E5E2DC] rounded-2xl shadow-[0_2px_8px_rgba(28,25,23,0.04)] open:border-[#FDBA74] open:shadow-[0_4px_16px_rgba(28,25,23,0.06)] transition-all"
                >
                  <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                    <span className="text-sm font-bold text-[#1C1917] leading-snug">{item.q}</span>
                    <span className="w-6 h-6 shrink-0 rounded-full border border-[#E5E2DC] bg-[#FAF9F6] text-[#78716C] flex items-center justify-center transition-transform duration-200 group-open:rotate-45 group-open:text-[#D97706] group-open:border-[#FDBA74]">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                    </span>
                  </summary>
                  <div className="px-5 pb-4 -mt-0.5">
                    <p className="text-sm text-[#57534E] leading-relaxed border-t border-[#F0EDE8] pt-3">
                      {item.a}
                    </p>
                  </div>
                </details>
              ))}
            </div>
          </section>
        ))}

        <div className="p-5 bg-[#FEF3C7]/40 border border-[#FDE68A] rounded-2xl">
          <p className="text-sm font-bold text-[#92400E]">Pertanyaan Anda belum terjawab?</p>
          <p className="text-xs text-[#92400E]/80 mt-1 leading-relaxed">
            Hubungi tim kami melalui WhatsApp atau formulir kontak — kami membalas pada jam operasional
            06:00 – 21:00 WIB.
          </p>
          <a
            href="/kontak"
            className="mt-3 inline-block px-4 py-2 bg-[#D97706] hover:bg-[#B45309] text-white text-xs font-bold rounded-xl transition active:scale-95"
          >
            Hubungi Kami
          </a>
        </div>
      </div>
    </PageShell>
  )
}

