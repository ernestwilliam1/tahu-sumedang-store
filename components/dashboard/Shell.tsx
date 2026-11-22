import Link from 'next/link'

interface ShellProps {
  title: string
  subtitle?: string
  role?: string
  current?: string // current dashboard key: admin|supplier|finance|owner
  children: React.ReactNode
}

function Shell({ title, subtitle, role, current, children }: ShellProps) {
  const isOwner = role === 'SUPERADMIN' || role === 'OWNER'
  const showExit = isOwner && current && current !== 'owner'

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1C1917] aura-amber">
      {/* Top Banner if Owner is inspecting other roles' dashboards */}
      {showExit && (
        <div className="bg-gradient-to-r from-[#FFF7ED] to-[#FFEDD5] border-b border-[#FDBA74] px-6 py-2.5">
          <div className="max-w-[var(--content-max)] mx-auto flex items-center justify-between gap-3 text-xs">
            <span className="text-[#9A3412] font-medium">
              Mode Inspeksi: Anda masuk sebagai <strong>{role}</strong> melihat modul operasional ini.
            </span>
            <Link
              href="/dashboard/owner"
              className="px-3 py-1.5 text-white font-bold rounded-full text-xs transition shadow-[0_2px_8px_rgba(217,119,6,0.25)]"
              style={{ background: 'linear-gradient(135deg,#D97706,#EA8A1A)' }}
            >
              ← Kembali ke Dashboard Owner
            </Link>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="max-w-[var(--content-max)] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Top Header Card — 10/10 premium */}
        <header className="relative p-5 sm:p-6 bg-white border border-[#EDE9E3] rounded-[20px] shadow-[0_2px_8px_rgba(28,25,23,0.04),0_8px_24px_rgba(28,25,23,0.05)] overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: 'linear-gradient(90deg,#D97706,#EA8A1A,#C45A2E)' }} aria-hidden />
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-sm" style={{ background: 'linear-gradient(135deg,#FFF7ED,#FFEDD5)', borderColor: '#FDBA74', color: '#9A3412' }}>
                {role || 'MANAGEMENT'}
              </span>
              <span className="text-xs text-[#78716C] font-medium">Portal Operasional Tahu Sumedang</span>
            </div>
            <h1 className="text-[22px] sm:text-[26px] font-extrabold text-[#1C1917] tracking-tight leading-none">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs sm:text-sm font-medium text-[#57534E] mt-1.5">
                {subtitle}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <Link
              href="/"
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-[#1C1917] bg-[#FAF9F6] border border-[#EDE9E3] rounded-full hover:bg-white hover:border-[#D6D3D1] transition shadow-sm"
            >
              ← Lihat Toko
            </Link>

            {isOwner && current !== 'owner' && (
              <Link
                href="/dashboard/owner"
                className="hidden sm:inline-flex px-4 py-2 text-xs sm:text-sm font-bold rounded-full border shadow-sm transition"
                style={{ background: 'linear-gradient(135deg,#FFF7ED,#FFEDD5)', borderColor: '#FDBA74', color: '#9A3412' }}
              >
                Dashboard Owner
              </Link>
            )}

            <form
              action={async () => {
                'use server'
                const { clearSessionCookie } = await import('@/lib/auth')
                await clearSessionCookie()
                const { redirect } = await import('next/navigation')
                redirect('/')
              }}
            >
              <button
                type="submit"
                className="px-4 py-2 text-xs sm:text-sm font-semibold bg-white border border-[#EDE9E3] text-[#78716C] hover:text-[#991B1B] hover:bg-[#FEF2F2] hover:border-[#FECACA] rounded-full transition shadow-sm"
              >
                Keluar
              </button>
            </form>
          </div>
        </header>

        {children}
      </div>
    </div>
  )
}

export { Shell }
