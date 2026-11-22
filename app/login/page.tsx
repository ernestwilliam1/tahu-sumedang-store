'use client'

import { Suspense, useState, useTransition, useId } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, ArrowLeft, ShieldCheck } from 'lucide-react'
import { loginAction, resetPasswordAction } from '@/lib/authActions'
import { AuthShowcase } from '@/components/auth/AuthShowcase'

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const id = useId()
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)

  const [err, setErr] = useState<string | null>(
    params.get('error') === 'forbidden' ? 'Akses ditolak untuk role akun Anda.' : null
  )
  const [ok, setOk] = useState<string | null>(null)
  const [pending, start] = useTransition()
  const [showForgot, setShowForgot] = useState(false)

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

  const isCheckoutBounce = safeTarget.includes('katalog') || safeTarget.includes('checkout') || safeTarget.includes('produk')

  const onEmailLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    setErr(null)
    setOk(null)
    start(async () => {
      const r = await loginAction(fd)
      if (!r.success) {
        setErr(r.message)
      } else {
        router.push(safeTarget)
        router.refresh()
      }
    })
  }

  const onReset = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    setErr(null)
    setOk(null)
    start(async () => {
      const r = await resetPasswordAction(fd)
      if (!r.success) {
        setErr(r.message)
      } else {
        setOk(r.message)
        setShowForgot(false)
        ;(e.target as HTMLFormElement).reset()
      }
    })
  }

  return (
    <div className="w-full flex flex-col gap-3.5">
      {rawCallbackUrl && isCheckoutBounce && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-medium text-amber-900 flex items-center gap-2 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-[#D97706] shrink-0" />
          <span>Silakan masuk ke akun Anda untuk menyelesaikan proses pemesanan.</span>
        </div>
      )}

      {err && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-medium text-red-700 animate-fade-in flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0" />
          <span>{err}</span>
        </div>
      )}

      {ok && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-medium text-emerald-800 animate-fade-in flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
          <span>{ok}</span>
        </div>
      )}

      {/* Main Login Form */}
      <form onSubmit={onEmailLogin} className="space-y-3.5">
        {/* Email Field */}
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

        {/* Password Field */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label htmlFor={`${id}-password`} className="block text-xs font-semibold text-[#1C1917]">
              Kata Sandi
            </label>
            <button
              type="button"
              onClick={() => setShowForgot((v) => !v)}
              className="text-xs font-medium text-[#D97706] hover:text-[#B45309] transition cursor-pointer"
            >
              Lupa Kata Sandi?
            </button>
          </div>
          <div className="relative">
            <input
              id={`${id}-password`}
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="current-password"
              placeholder="••••••••••"
              className="w-full h-10 pl-3 pr-10 bg-[#FAF9F6] border border-[#E5E2DC] rounded-xl text-xs sm:text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:bg-white focus:border-[#D97706] focus:ring-2 focus:ring-[#D97706]/15 focus:outline-none transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
              className="absolute right-0 top-0 h-10 w-10 flex items-center justify-center text-[#78716C] hover:text-[#1C1917] transition cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Remember Me */}
        <div className="flex items-center justify-between pt-0.5">
          <label htmlFor={`${id}-remember`} className="flex items-center gap-2 cursor-pointer select-none">
            <input
              id={`${id}-remember`}
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-[#D6D3D1] text-[#D97706] focus:ring-[#D97706]/20 cursor-pointer accent-[#D97706]"
            />
            <span className="text-xs text-[#57534E]">Ingat saya di perangkat ini</span>
          </label>
        </div>

        {/* Submit Button */}
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
              <span>Memproses...</span>
            </>
          ) : (
            <span>Masuk ke Akun</span>
          )}
        </button>
      </form>

      {/* Forgot Password Drawer */}
      {showForgot && (
        <div className="p-3.5 bg-[#FAF9F6] border border-[#E5E2DC] rounded-xl space-y-2.5 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#1C1917] uppercase tracking-wide flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D97706]" />
              Reset Kata Sandi
            </h3>
            <button
              type="button"
              onClick={() => setShowForgot(false)}
              className="text-xs text-[#78716C] hover:text-[#1C1917]"
            >
              Tutup
            </button>
          </div>
          <form onSubmit={onReset} className="space-y-2">
            <input
              name="email"
              type="email"
              required
              placeholder="Email terdaftar"
              className="w-full h-9 px-3 bg-white border border-[#D6D3D1] rounded-lg text-xs text-[#1C1917] focus:border-[#D97706] focus:outline-none transition"
            />
            <input
              name="newPassword"
              type="password"
              required
              placeholder="Kata sandi baru (minimal 6 karakter)"
              className="w-full h-9 px-3 bg-white border border-[#D6D3D1] rounded-lg text-xs text-[#1C1917] focus:border-[#D97706] focus:outline-none transition"
            />
            <input
              name="confirmPassword"
              type="password"
              required
              placeholder="Konfirmasi kata sandi baru"
              className="w-full h-9 px-3 bg-white border border-[#D6D3D1] rounded-lg text-xs text-[#1C1917] focus:border-[#D97706] focus:outline-none transition"
            />
            <div className="flex gap-2 pt-0.5">
              <button
                type="button"
                onClick={() => setShowForgot(false)}
                className="flex-1 py-1.5 border border-[#E5E2DC] rounded-lg text-xs font-semibold bg-white text-[#57534E] hover:bg-[#F3F1ED] transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={pending}
                className="flex-1 py-1.5 bg-[#D97706] text-white rounded-lg text-xs font-bold hover:bg-[#B45309] shadow-2xs disabled:opacity-40 transition cursor-pointer"
              >
                {pending ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Switch to Register */}
      <div className="pt-1 text-center text-xs text-[#57534E] flex items-center justify-center gap-1.5">
        <span>Belum memiliki akun?</span>
        <Link
          href={rawCallbackUrl ? `/register?callbackUrl=${encodeURIComponent(safeTarget)}` : '/register'}
          className="font-bold text-[#D97706] hover:text-[#B45309] hover:underline transition"
        >
          Daftar Sekarang
        </Link>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <main
      aria-label="Sign in"
      className="min-h-screen w-full bg-[#FAF9F6] text-[#1C1917] flex items-center justify-center p-3 sm:p-5 relative"
    >
      {/* Warm Ambient Glow in Center */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-[radial-gradient(ellipse_at_center,_rgba(217,119,6,0.06),_transparent_70%)]" />
      </div>

      {/* COMPACT & BALANCED DUAL-PANEL CARD */}
      <div className="relative z-10 w-full max-w-[880px] bg-white border border-[#E5E2DC] rounded-2xl sm:rounded-3xl shadow-[0_12px_40px_rgba(0,0,0,0.05)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch">
        
        {/* LEFT PANEL: Form (7 of 12 cols on desktop) */}
        <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
          <div>
            {/* Top Back Link & Logo */}
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

            {/* Header */}
            <div className="mb-5">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1C1917]">
                Masuk Akun
              </h1>
              <p className="text-xs text-[#78716C] mt-1 font-medium">
                Silakan masukkan alamat email dan kata sandi Anda.
              </p>
            </div>

            {/* Form */}
            <Suspense fallback={<div className="py-4 text-center text-xs text-[#78716C]">Memuat formulir...</div>}>
              <LoginForm />
            </Suspense>
          </div>

          {/* Footer Copyright */}
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
