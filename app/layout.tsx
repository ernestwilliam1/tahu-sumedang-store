import type { Metadata } from 'next'
import './globals.css'

const base = (process.env.NEXT_PUBLIC_SITE_URL || 'https://tahusumedang.example.com').replace(/\/$/, '')

export const metadata: Metadata = {
  metadataBase: new URL(base),
  title: { default: 'Tahu Sumedang — Renyah Asli Priangan', template: '%s | Tahu Sumedang' },
  description:
    'Tahu Sumedang digoreng segar setiap pesanan. Renyah di luar, lembut kopong di dalam, disajikan hangat dengan cabai rawit hijau segar.',
  keywords: ['tahu sumedang', 'tahu krispy', 'kuliner sumedang', 'oleh-oleh priangan', 'tahu goreng', 'tahu walik', 'tahu mercon'],
  authors: [{ name: 'Tahu Sumedang Store' }],
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    siteName: 'Tahu Sumedang',
    title: 'Tahu Sumedang — Renyah Asli Priangan',
    description: 'Tahu Sumedang digoreng segar setiap pesanan — renyah di luar, lembut di dalam.',
    url: base,
  },
  twitter: { card: 'summary_large_image', title: 'Tahu Sumedang — Renyah Asli Priangan', description: 'Renyah di luar, lembut kopong di dalam.' },
  robots: { index: true, follow: true },
  alternates: { canonical: base },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="noise">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[999] focus:px-4 focus:py-2 focus:bg-[#1C1917] focus:text-white focus:rounded-lg focus:text-sm focus:font-bold">Lewati ke konten utama</a>
        <div id="main-content">{children}</div>
      </body>
    </html>
  )
}
