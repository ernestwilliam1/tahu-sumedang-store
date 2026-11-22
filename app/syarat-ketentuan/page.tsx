import type { Metadata } from 'next'
import { PageShell, ProseCard, SectionHeading, Body, Bullets } from '@/components/PageShell'
import { getSession } from '@/lib/auth'

export const metadata: Metadata = {
  title: 'Syarat & Ketentuan',
  description:
    'Syarat dan ketentuan pemesanan Tahu Sumedang: aturan pesanan, batas waktu pembayaran, kebijakan pembatalan, retur, dan penyelesaian sengketa.',
  alternates: { canonical: '/syarat-ketentuan' },
}

const LAST_UPDATED = '10 November 2026'

export default async function SyaratKetentuanPage() {
  const s = await getSession()
  return (
    <PageShell
      session={s ? { name: s.name, role: s.role } : null}
      eyebrow="Legal"
      title="Syarat & Ketentuan"
      description="Ketentuan ini mengatur hubungan antara Anda sebagai pelanggan dengan Tahu Sumedang Official dalam setiap transaksi yang dilakukan melalui situs ini."
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3 px-4 py-3 bg-[#FAF9F6] border border-[#E5E2DC] rounded-xl">
          <span className="text-xs font-semibold text-[#57534E]">Terakhir diperbarui</span>
          <span className="text-xs font-bold text-[#1C1917] font-[family-name:var(--font-mono)]">{LAST_UPDATED}</span>
        </div>

        <ProseCard>
          <SectionHeading>1. Penerimaan Ketentuan</SectionHeading>
          <Body>
            Dengan mengakses situs, membuat akun, atau menyelesaikan pesanan, Anda menyatakan telah membaca
            dan menyetujui seluruh ketentuan pada halaman ini. Apabila Anda tidak setuju, mohon untuk tidak
            melanjutkan penggunaan layanan.
          </Body>
        </ProseCard>

        <ProseCard>
          <SectionHeading>2. Akun Pelanggan</SectionHeading>
          <Bullets
            items={[
              'Satu akun digunakan untuk satu identitas pelanggan dan tidak boleh dipindahtangankan tanpa persetujuan kami.',
              'Anda bertanggung jawab menjaga kerahasiaan kata sandi serta seluruh aktivitas yang terjadi pada akun Anda.',
              'Data yang Anda daftarkan harus akurat. Nama, nomor WhatsApp, dan alamat yang salah dapat menyebabkan pesanan gagal dikirim.',
              'Akun dengan indikasi penyalahgunaan (pesanan fiktif, spam retur, manipulasi pembayaran) dapat dibekukan sewaktu-waktu.',
            ]}
          />
        </ProseCard>

        <ProseCard>
          <SectionHeading>3. Harga & Ketersediaan Produk</SectionHeading>
          <Bullets
            items={[
              'Seluruh harga ditampilkan dalam Rupiah (IDR) dan sudah termasuk pajak yang berlaku, namun belum termasuk biaya pengiriman.',
              'Harga dapat berubah tanpa pemberitahuan sebelumnya. Harga yang mengikat adalah harga pada saat pesanan dikonfirmasi.',
              'Stok bersifat real-time. Apabila terjadi selisih stok akibat pesanan bersamaan, kami akan menghubungi Anda untuk penyesuaian atau pengembalian dana.',
              'Promo dan voucher memiliki masa berlaku, syarat minimum belanja, serta tidak dapat digabung dengan promo lain kecuali dinyatakan lain.',
            ]}
          />
        </ProseCard>

        <ProseCard>
          <SectionHeading>4. Pemesanan & Pembayaran</SectionHeading>
          <Bullets
            items={[
              'Pesanan dinyatakan sah setelah sistem menerbitkan nomor pesanan dan pembayaran terverifikasi (kecuali metode COD).',
              'Virtual Account dan QRIS wajib dibayar dalam 24 jam; kode pembayaran retail (Indomaret/Alfamart) dalam 48 jam.',
              'Pesanan yang melewati batas waktu otomatis dibatalkan oleh sistem dan stok dikembalikan ke persediaan.',
              'Untuk metode COD, pesanan diproses setelah pesanan dikonfirmasi dan dibayar tunai saat barang diterima kurir.',
              'Bukti pembayaran wajib disimpan hingga pesanan selesai untuk keperluan rekonsiliasi.',
            ]}
          />
        </ProseCard>

        <ProseCard>
          <SectionHeading>5. Jendela Pembatalan Pesanan</SectionHeading>
          <Body>
            Pembatalan dapat diajukan melalui portal pelanggan pada menu Riwayat Pesanan. Ketentuan yang
            berlaku:
          </Body>
          <Bullets
            items={[
              'Status PENDING / AWAITING_PAYMENT / PROCESSING: dapat dibatalkan langsung oleh pelanggan tanpa biaya.',
              'Status PACKED atau SHIPPED: pembatalan memerlukan persetujuan Admin; apabila kurir sudah berangkat, biaya pengiriman tidak dapat dikembalikan.',
              'Status DELIVERED atau CANCELLED: tidak dapat dibatalkan melalui sistem.',
              'Pesanan yang sudah lunas hanya dapat dibatalkan oleh Owner atau Finance, dengan pengembalian dana sesuai kebijakan pada poin 7.',
            ]}
          />
        </ProseCard>

        <ProseCard>
          <SectionHeading>6. Pengiriman & Pengambilan</SectionHeading>
          <Bullets
            items={[
              'Estimasi waktu pengiriman bersifat perkiraan dan dapat dipengaruhi cuaca, lalu lintas, serta jam sibuk dapur.',
              'Pelanggan wajib memastikan alamat dan nomor telepon aktif. Kegagalan pengiriman akibat data tidak valid bukan tanggung jawab kami.',
              'Untuk opsi ambil sendiri, pesanan disimpan maksimal 6 jam setelah status siap diambil.',
              'Risiko kerusakan produk setelah diterima sepenuhnya menjadi tanggung jawab pelanggan.',
            ]}
          />
        </ProseCard>

        <ProseCard>
          <SectionHeading>7. Retur, Penukaran & Pengembalian Dana</SectionHeading>
          <Bullets
            items={[
              'Pengajuan retur hanya berlaku untuk pesanan berstatus lunas (PAID) dan diajukan maksimal 1×24 jam sejak pesanan diterima.',
              'Alasan retur yang diterima: produk tidak sesuai pesanan, produk rusak saat diterima, atau jumlah tidak sesuai.',
              'Produk pangan yang sudah dibuka atau dikonsumsi sebagian tidak dapat diretur, kecuali terbukti rusak sebelum dikonsumsi.',
              'Pengembalian dana diproses maksimal 7 hari kerja ke rekening bank atas nama pelanggan yang bersangkutan, atau dikonversi menjadi voucher sesuai kesepakatan.',
            ]}
          />
        </ProseCard>

        <ProseCard>
          <SectionHeading>8. Penyelesaian Sengketa</SectionHeading>
          <Body>
            Kami mengutamakan penyelesaian secara musyawarah. Alur penyelesaian sengketa:
          </Body>
          <Bullets
            items={[
              'Tahap 1 — Pelanggan menghubungi layanan pelanggan melalui WhatsApp atau formulir kontak dengan menyertakan nomor pesanan, kronologi, dan bukti pendukung.',
              'Tahap 2 — Kami menanggapi dalam 2 hari kerja dan menawarkan penyelesaian (penggantian produk, voucher, atau pengembalian dana).',
              'Tahap 3 — Apabila tidak tercapai kesepakatan dalam 7 hari kerja, para pihak sepakat menyelesaikan sengketa secara non-litigasi terlebih dahulu.',
              'Hukum yang berlaku adalah hukum Republik Indonesia.',
            ]}
          />
        </ProseCard>

        <ProseCard>
          <SectionHeading>9. Kekayaan Intelektual</SectionHeading>
          <Body>
            Nama, logo, foto produk, tulisan, dan seluruh materi pada situs ini dilindungi hak kekayaan
            intelektual. Penggunaan komersial tanpa izin tertulis dari Tahu Sumedang Official dilarang.
          </Body>
        </ProseCard>

        <ProseCard>
          <SectionHeading>10. Perubahan Ketentuan</SectionHeading>
          <Body>
            Kami dapat memperbarui ketentuan ini sewaktu-waktu. Versi terbaru selalu dipublikasikan pada
            halaman ini beserta tanggal pembaruan. Penggunaan layanan setelah pembaruan dianggap sebagai
            persetujuan atas ketentuan yang berlaku.
          </Body>
        </ProseCard>

        <div className="text-sm text-[#57534E] leading-relaxed">
          Pertanyaan mengenai ketentuan ini dapat disampaikan melalui halaman{' '}
          <a href="/kontak" className="font-bold text-[#D97706] hover:underline">Kontak</a> atau WhatsApp
          resmi kami.
        </div>
      </div>
    </PageShell>
  )
}

