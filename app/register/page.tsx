'use client'

import { Suspense, useState, useTransition, useId } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { registerAction } from '@/lib/authActions'
import { AuthShowcase } from '@/components/auth/AuthShowcase'

function RegisterForm() {
  const router = useRouter()
  const params = useSearchParams()
  const id = useId()
  const [showPassword, setShowPassword] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [pending, start] = useTransition()

  const rawCallbackUrl = params.get('callbackUrl') || params.get('returnUrl') || params.get('redirect')
  let safeTarget = '/'
  if (rawCallbackUrl) {
    try {
      const decoded = decodeURIComponent(rawCallbackUrl)
      if (decoded.startsWith('/') && !decoded.startsWith('//')) {
        safeTarget = decoded
      }
    } catch {
      safeTarget = '/'
    }
  }

  const onRegister = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    setErr(null)
    start(async () => {
      const r = await registerAction(fd)
      if (!r.success) {
        setErr(r.message)
      } else {
        router.push(safeTarget)
        router.refresh()
      }
    })
  }

  return (
    <div className="w-full flex flex-col gap-3.5">
      {err && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-medium text-red-700 animate-fade-in flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0" />
          <span>{err}</span>
        </div>
      )}

      <form onSubmit={onRegister} className="space-y-3.5">
        <div className="space-y-1">
          <label htmlFor={`${id}-name`} className="block text-xs font-semibold text-[#1C1917]">
            Nama Lengkap
          </label>
          <input
            id={`${id}-name`}
            name="name"
            required
            autoComplete="name"
            placeholder="Nama lengkap Anda"
            className="w-full h-10 px-3 bg-[#FAF9F6] border border-[#E5E2DC] rounded-xl text-xs sm:text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:bg-white focus:border-[#D97706] focus:ring-2 focus:ring-[#D97706]/15 focus:outline-none transition"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor={`${id}-email`} className="block text-xs font-semibold text-[#1C1917]">
            Alamat Email
          </label>
          <input
            id={`${id}-email`}
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="nama@email.com"
            className="w-full h-10 px-3 bg-[#FAF9F6] border border-[#E5E2DC] rounded-xl text-xs sm:text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:bg-white focus:border-[#D97706] focus:ring-2 focus:ring-[#D97706]/15 focus:outline-none transition"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor={`${id}-password`} className="block text-xs font-semibold text-[#1C1917]">
            Kata Sandi
          </label>
          <div className="relative">
            <input
              id={`${id}-password`}
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              minLength={6}
              autoComplete="new-password"
              placeholder="Minimal 6 karakter"
              className="w-full h-10 pl-3 pr-10 bg-[#FAF9F6] border border-[#E5E2DC] rounded-xl text-xs sm:text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:bg-white focus:border-[#D97706] focus:ring-2 focus:ring-[#D97706]/15 focus:outline-none transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
              className="absolute right-0 top-0 h-10 w-10 flex items-center justify-center text-[#78716C] hover:text-[#1C1917] transition cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full h-10 sm:h-11 mt-1 bg-[#D97706] hover:bg-[#B45309] active:scale-[0.99] text-white text-xs sm:text-sm font-bold tracking-wide rounded-xl shadow-[0_4px_12px_rgba(217,119,6,0.2)] hover:shadow-[0_6px_16px_rgba(217,119,6,0.28)] disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          {pending ? (
            <>
              <svg className="w-3.5 h-3.5 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span>Mendaftarkan...</span>
            </>
          ) : (
            <span>Buat Akun</span>
          )}
        </button>
      </form>

      <div className="pt-1 text-center text-xs text-[#57534E] flex items-center justify-center gap-1.5">
        <span>Sudah memiliki akun?</span>
        <Link
          href={rawCallbackUrl ? `/login?callbackUrl=${encodeURIComponent(safeTarget)}` : '/login'}
          className="font-bold text-[#D97706] hover:text-[#B45309] hover:underline transition"
        >
          Masuk di Sini
        </Link>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <main
      aria-label="Daftar akun"
      className="min-h-screen w-full bg-[#FAF9F6] text-[#1C1917] flex items-center justify-center p-3 sm:p-5 relative"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-[radial-gradient(ellipse_at_center,_rgba(217,119,6,0.06),_transparent_70%)]" />
      </div>

      <div className="relative z-10 w-full max-w-[880px] bg-white border border-[#E5E2DC] rounded-2xl sm:rounded-3xl shadow-[0_12px_40px_rgba(0,0,0,0.05)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch">
        {/* LEFT PANEL: Form */}
        <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#78716C] hover:text-[#1C1917] transition group"
              >
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                <span>Kembali ke Beranda</span>
              </Link>
              <img
                src={encodeURI('/images/logo_tahu_sumedang.png')}
                alt="Tahu Sumedang"
                className="h-6 w-auto object-contain opacity-90"
                draggable={false}
              />
            </div>

            <div className="mb-5">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1C1917]">
                Daftar Akun
              </h1>
              <p className="text-xs text-[#78716C] mt-1 font-medium">
                Lengkapi data berikut untuk membuat akun baru.
              </p>
            </div>

            <Suspense fallback={<div className="py-4 text-center text-xs text-[#78716C]">Memuat formulir...</div>}>
              <RegisterForm />
            </Suspense>
          </div>

          <p className="mt-6 text-center sm:text-left text-[11px] text-[#A8A29E]">
            © {new Date().getFullYear()} Tahu Sumedang. Hak Cipta Dilindungi Undang-Undang.
          </p>
        </div>

        {/* RIGHT PANEL: Menu Showcase */}
        <div className="lg:col-span-5 relative">
          <AuthShowcase />
        </div>
      </div>
    </main>
  )
}
