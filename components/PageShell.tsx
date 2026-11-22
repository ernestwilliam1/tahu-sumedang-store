'use client'

import { useRouter } from 'next/navigation'
import { Footer } from './Footer'
import { Navbar } from './Navbar'

interface PageShellProps {
  eyebrow: string
  title: string
  description: string
  session?: { name: string; role: string } | null
  children: React.ReactNode
}

export function PageShell({ eyebrow, title, description, session = null, children }: PageShellProps) {
  const router = useRouter()

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#1C1917]">
      <Navbar cartCount={0} onOpenCart={() => router.push('/katalog')} session={session} />

      <main className="flex-1 pt-[72px] sm:pt-20">
        <section className="border-b border-[#E5E2DC] bg-white">
          <div className="max-w-[880px] mx-auto px-6 sm:px-8 py-12 sm:py-16">
            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-[#FEF3C7] text-[#92400E] text-[11px] font-semibold tracking-[0.12em] uppercase">
              {eyebrow}
            </span>
            <h1 className="mt-4 text-[32px] sm:text-[40px] font-semibold leading-[1.2] text-[#1C1917]">
              {title}
            </h1>
            <p className="mt-3 text-[15px] sm:text-base text-[#78716C] leading-[1.6] max-w-[60ch]">
              {description}
            </p>
          </div>
        </section>

        <div className="max-w-[880px] mx-auto px-6 sm:px-8 py-10 sm:py-14">{children}</div>
      </main>

      <Footer />
    </div>
  )
}

export function ProseCard({ children }: { children: React.ReactNode }) {
  return (
    <article
      className="bg-white border border-[#E5E2DC] rounded-xl p-6 sm:p-8 space-y-5"
      style={{ boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03), 0 2px 4px -2px rgba(0,0,0,0.03)' }}
    >
      {children}
    </article>
  )
}

export function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[20px] font-semibold text-[#1C1917] leading-[1.4]">{children}</h2>
  )
}

export function Body({ children }: { children: React.ReactNode }) {
  return <p className="text-[15px] text-[#57534E] leading-[1.7]">{children}</p>
}

export function Bullets({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map((it, i) => (
        <li key={i} className="flex gap-2.5 text-[15px] text-[#57534E] leading-[1.7]">
          <span className="text-[#D97706] shrink-0 mt-0.5">•</span>
          <span>{it}</span>
        </li>
      ))}
    </ul>
  )
}
