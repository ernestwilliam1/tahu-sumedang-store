'use client'

import Link from 'next/link'
import { useEffect } from 'react'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 bg-[#FAF9F6] p-8 text-center">
      <span className="w-14 h-14 rounded-2xl bg-white border border-[#E5E2DC] flex items-center justify-center text-2xl text-[#D97706] font-black shadow-xs">
        !
      </span>
      <h1 className="text-2xl font-extrabold text-[#1C1917] tracking-tight">Terjadi kesalahan</h1>
      <p className="text-sm text-[#57534E] max-w-md">
        Halaman gagal dimuat. Silakan coba lagi — jika masih gagal, hubungi kami melalui halaman kontak.
      </p>
      {error.digest ? (
        <p className="text-xs font-mono text-[#A8A29E]">Kode: {error.digest}</p>
      ) : null}
      <div className="flex gap-2 mt-2">
        <button
          onClick={reset}
          className="px-5 py-2.5 bg-[#D97706] hover:bg-[#B45309] text-white text-sm font-bold rounded-xl"
        >
          Coba Lagi
        </button>
        <Link
          href="/"
          className="px-5 py-2.5 bg-white border border-[#E5E2DC] text-[#1C1917] text-sm font-bold rounded-xl"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  )
}
