import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 bg-[#FAF9F6] p-8 text-center">
      <span className="w-14 h-14 rounded-2xl bg-white border border-[#E5E2DC] flex items-center justify-center text-2xl shadow-xs">◇</span>
      <h1 className="text-2xl font-extrabold text-[#1C1917] tracking-tight">Halaman tidak ditemukan</h1>
      <p className="text-sm text-[#57534E] max-w-md">Maaf, halaman atau produk yang kamu cari tidak ada. Cek alamat atau kembali ke katalog.</p>
      <div className="flex gap-2 mt-2">
        <Link href="/" className="px-5 py-2.5 bg-[#D97706] hover:bg-[#B45309] text-white text-sm font-bold rounded-xl">Kembali ke Beranda</Link>
        <Link href="/katalog" className="px-5 py-2.5 bg-white border border-[#E5E2DC] text-[#1C1917] text-sm font-bold rounded-xl">Lihat Katalog</Link>
      </div>
    </div>
  )
}
