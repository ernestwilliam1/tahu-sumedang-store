import type { Metadata } from 'next'
import { PageShell, ProseCard, SectionHeading, Body, Bullets } from '@/components/PageShell'
import { getSession } from '@/lib/auth'

export const metadata: Metadata = {
  title: 'Kebijakan Privasi',
  description:
    'Kebijakan privasi Tahu Sumedang: data apa yang dikumpulkan, dasar hukum pemrosesan, masa penyimpanan, dan hak Anda atas data pribadi.',
  alternates: { canonical: '/kebijakan-privasi' },
}

const LAST_UPDATED = '10 November 2026'

const COLLECTED = [
  'Data identitas: nama lengkap dan alamat email saat pendaftaran akun.',
  'Data kontak: nomor WhatsApp dan alamat pengiriman yang Anda isi saat checkout.',
  'Data transaksi: riwayat pesanan, metode pembayaran, nominal, dan status pembayaran.',
  'Data teknis: alamat IP, jenis perangkat, dan halaman yang dikunjungi untuk keperluan keamanan serta analitik agregat.',
  'Data ulasan: rating dan komentar yang Anda kirimkan pada halaman produk.',
]

export default async function KebijakanPrivasiPage() {
  const s = await getSession()
  return (
    <PageShell
      session={s ? { name: s.name, role: s.role } : null}
      eyebrow="Legal"
      title="Kebijakan Privasi"
      description="Kami menghormati privasi Anda. Halaman ini menjelaskan data apa yang kami kumpulkan, mengapa data tersebut diperlukan, dan bagaimana Anda dapat mengendalikannya."
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3 px-4 py-3 bg-[#FAF9F6] border border-[#E5E2DC] rounded-xl">
          <span className="text-xs font-semibold text-[#57534E]">Terakhir diperbarui</span>
          <span className="text-xs font-bold text-[#1C1917] font-[family-name:var(--font-mono)]">{LAST_UPDATED}</span>
        </div>

        <ProseCard>
          <SectionHeading>1. Ruang Lingkup</SectionHeading>
          <Body>
            Kebijakan ini berlaku untuk seluruh data pribadi yang diproses melalui situs Tahu Sumedang,
            termasuk saat Anda mendaftar akun, melakukan pemesanan, mengirim ulasan, atau menghubungi
            layanan pelanggan.
          </Body>
        </ProseCard>

        <ProseCard>
          <SectionHeading>2. Data yang Kami Kumpulkan</SectionHeading>
          <Bullets items={COLLECTED} />
          <Body>
            Kami tidak menyimpan data kartu debit/kredit maupun PIN. Untuk pembayaran melalui Virtual
            Account, QRIS, atau gerai retail, data transaksi diproses oleh penyedia layanan pembayaran
            terkait sesuai kebijakan privasi mereka.
          </Body>
        </ProseCard>

        <ProseCard>
          <SectionHeading>3. Dasar &amp; Tujuan Pemrosesan</SectionHeading>
          <Bullets
            items={[
              'Menjalankan pesanan: memproses, mengemas, dan mengirimkan pesanan sesuai alamat yang Anda berikan.',
              'Komunikasi transaksional: mengirim informasi status pesanan, kode pembayaran, dan konfirmasi pembayaran.',
              'Keamanan layanan: mencegah penyalahgunaan akun, penipuan pembayaran, dan aktivitas mencurigakan.',
              'Peningkatan layanan: analitik agregat mengenai preferensi menu dan performa gerai, tanpa mengidentifikasi individu.',
              'Pemenuhan kewajiban hukum: pencatatan transaksi untuk keperluan pembukuan dan audit.',
            ]}
          />
        </ProseCard>

        <ProseCard>
          <SectionHeading>4. Dasar Hukum</SectionHeading>
          <Body>
            Pemrosesan data dilakukan atas dasar pelaksanaan perjanjian jual beli (pemenuhan pesanan),
            persetujuan Anda (komunikasi promosi, apabila Anda memilih untuk menerimanya), serta kepentingan
            sah kami dalam menjaga keamanan dan keberlangsungan layanan.
          </Body>
        </ProseCard>

        <ProseCard>
          <SectionHeading>5. Masa Penyimpanan</SectionHeading>
          <Bullets
            items={[
              'Data transaksi disimpan minimal 5 tahun untuk memenuhi kewajiban pembukuan dan perpajakan.',
              'Data akun disimpan selama akun Anda aktif. Jika akun dihapus, data identitas dianonimkan dalam 30 hari.',
              'Data teknis dan log keamanan disimpan maksimal 12 bulan.',
              'Data ulasan tetap ditampilkan secara publik meskipun akun dinonaktifkan, kecuali Anda meminta penghapusan.',
            ]}
          />
        </ProseCard>

        <ProseCard>
          <SectionHeading>6. Pembagian Data kepada Pihak Ketiga</SectionHeading>
          <Body>
            Kami tidak menjual data pribadi Anda. Data hanya dibagikan kepada pihak yang diperlukan untuk
            menjalankan layanan:
          </Body>
          <Bullets
            items={[
              'Jasa pengiriman dan kurir, untuk keperluan pengantaran pesanan (nama, nomor telepon, alamat).',
              'Penyedia layanan pembayaran, untuk membuat Virtual Account, QRIS, atau kode pembayaran retail.',
              'Penyedia infrastruktur hosting dan basis data, dengan akses terbatas dan perjanjian kerahasiaan.',
              'Aparat penegak hukum, apabila diwajibkan oleh peraturan perundang-undangan yang berlaku.',
            ]}
          />
        </ProseCard>

        <ProseCard>
          <SectionHeading>7. Keamanan Data</SectionHeading>
          <Bullets
            items={[
              'Kata sandi akun disimpan dalam bentuk hash (bcrypt) dan tidak pernah disimpan sebagai teks biasa.',
              'Sesi pengguna ditandatangani secara kriptografis (JWT) dan kedaluwarsa secara otomatis.',
              'Akses ke data pelanggan dibatasi berdasarkan peran (RBAC) — hanya staf berwenang yang dapat melihat data yang diperlukan.',
              'Meskipun demikian, tidak ada sistem yang sepenuhnya bebas risiko. Kami menyarankan penggunaan kata sandi yang unik dan kuat.',
            ]}
          />
        </ProseCard>

        <ProseCard>
          <SectionHeading>8. Hak Anda</SectionHeading>
          <Bullets
            items={[
              'Mengakses dan memperbarui data profil Anda kapan saja melalui halaman Profil.',
              'Meminta salinan data pribadi yang kami simpan mengenai Anda.',
              'Meminta perbaikan atas data yang tidak akurat.',
              'Meminta penghapusan data, sepanjang tidak bertentangan dengan kewajiban hukum penyimpanan transaksi.',
              'Menarik persetujuan atas komunikasi promosi tanpa memengaruhi proses pesanan yang sedang berjalan.',
            ]}
          />
          <Body>
            Permintaan dapat dikirim melalui halaman Kontak atau WhatsApp resmi. Kami akan menindaklanjuti
            dalam maksimal 14 hari kerja setelah verifikasi identitas.
          </Body>
        </ProseCard>

        <ProseCard>
          <SectionHeading>9. Cookie &amp; Teknologi Serupa</SectionHeading>
          <Body>
            Kami menggunakan cookie dan penyimpanan lokal (localStorage) untuk menjaga sesi login serta
            menyimpan preferensi seperti daftar favorit (wishlist). Anda dapat menghapus cookie melalui
            pengaturan peramban, namun sebagian fitur mungkin tidak berfungsi optimal.
          </Body>
        </ProseCard>

        <ProseCard>
          <SectionHeading>10. Data Anak</SectionHeading>
          <Body>
            Layanan ini tidak ditujukan untuk anak di bawah 17 tahun tanpa pengawasan orang tua atau wali.
            Apabila kami mengetahui adanya data anak yang dikumpulkan tanpa persetujuan yang sah, data
            tersebut akan dihapus.
          </Body>
        </ProseCard>

        <ProseCard>
          <SectionHeading>11. Perubahan Kebijakan</SectionHeading>
          <Body>
            Kebijakan ini dapat diperbarui seiring perubahan layanan atau peraturan. Versi terbaru selalu
            dipublikasikan pada halaman ini dengan tanggal pembaruan yang jelas.
          </Body>
        </ProseCard>

        <div className="text-sm text-[#57534E] leading-relaxed">
          Pertanyaan mengenai pemrosesan data pribadi dapat disampaikan melalui{' '}
          <a href="/kontak" className="font-bold text-[#D97706] hover:underline">halaman Kontak</a>.
        </div>
      </div>
    </PageShell>
  )
}

