'use client'

import { useRef, useEffect, useState, useTransition, useMemo } from 'react'
import Link from 'next/link'
import { formatRupiah } from '@/lib/utils'
import { uploadPaymentProof } from '@/lib/actions'
import QRCode from 'qrcode'

interface OrderSuccessProps {
  orderNumber: string
  totalAmount: number
  paymentMethod?: string
  vaNumber?: string
  qrisPayload?: string
  initialPaymentStatus?: string
  initialProofUrl?: string | null
  onClose: () => void
}

function methodLabel(m?: string): string {
  if (!m) return '—'
  if (m === 'TRANSFER_BCA' || m === 'VA_BCA') return 'Transfer Bank BCA'
  if (m === 'QRIS') return 'QRIS'
  if (m === 'COD') return 'COD (Cash On Delivery)'
  return m
}

export function OrderSuccess({
  orderNumber,
  totalAmount,
  paymentMethod,
  vaNumber,
  qrisPayload,
  initialPaymentStatus,
  initialProofUrl,
  onClose,
}: OrderSuccessProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [copied, setCopied] = useState(false)
  const [status, setStatus] = useState<string>(
    paymentMethod === 'COD' ? 'PAID' : (initialPaymentStatus || 'UNPAID')
  )
  const [proofUrl, setProofUrl] = useState<string | null>(initialProofUrl || null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isUploading, startUpload] = useTransition()
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null)
  const [qrSvg, setQrSvg] = useState<string | null>(null)

  const isCod = paymentMethod === 'COD'
  const isQris = paymentMethod === 'QRIS'
  const isTransferBca = paymentMethod === 'TRANSFER_BCA' || paymentMethod === 'VA_BCA'

  // Generate crisp QR code SVG when QRIS payload is provided
  useEffect(() => {
    if (isQris && qrisPayload) {
      QRCode.toString(qrisPayload, {
        type: 'svg',
        margin: 1,
        color: {
          dark: '#1C1917',
          light: '#FFFFFF',
        },
        errorCorrectionLevel: 'M',
      })
        .then((svg) => setQrSvg(svg))
        .catch((err) => console.error('Failed to generate QR code SVG:', err))
    }
  }, [isQris, qrisPayload])

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    import('gsap').then(({ gsap }) => {
      if (panelRef.current) {
        gsap.fromTo(
          panelRef.current,
          { scale: 0.96, opacity: 0, y: 12 },
          { scale: 1, opacity: 1, y: 0, duration: 0.35, ease: 'back.out(1.4)' }
        )
      }
    })
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  const copy = (t: string) => {
    navigator.clipboard?.writeText(t)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        setMsg({ text: 'Harap pilih file gambar (JPG, PNG, atau WebP).', ok: false })
        return
      }
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
      setMsg(null)
    }
  }

  const handleUploadProof = () => {
    if (!selectedFile) return
    startUpload(async () => {
      const fd = new FormData()
      fd.append('orderNumber', orderNumber)
      fd.append('file', selectedFile)
      const res = await uploadPaymentProof(fd)
      if (res.success && res.paymentProofUrl) {
        setStatus('WAITING_VERIFICATION')
        setProofUrl(res.paymentProofUrl)
        setMsg({ text: res.message, ok: true })
      } else {
        setMsg({ text: res.message, ok: false })
      }
    })
  }

  const invoiceDate = useMemo(
    () => new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }),
    []
  )

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 overflow-y-auto" style={{ isolation: 'isolate' }}>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden />

      <div
        ref={panelRef}
        className="relative z-10 w-full max-w-lg bg-white border border-[#E5E2DC] rounded-2xl shadow-[0_20px_50px_rgba(28,25,23,0.16)] my-auto overflow-hidden max-h-[92vh] flex flex-col"
      >
        <div className="absolute top-0 inset-x-0 h-1 bg-[#D97706]" />

        {status === 'PAID' ? (
          /* LUNAS / PAID STATE */
          <div className="overflow-y-auto">
            <div className="px-7 sm:px-8 pt-7 pb-5 text-center border-b border-dashed border-[#E5E2DC] bg-[#FAF9F6]/60">
              <div className="w-14 h-14 mx-auto rounded-full flex items-center justify-center border bg-[#D1FAE5] text-[#059669] border-[#A7F3D0] animate-pop-success shadow-[0_4px_16px_rgba(5,150,105,0.25)]">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="mt-3 text-xl font-extrabold tracking-tight text-[#1C1917]">
                {isCod ? 'Pesanan COD Diterima' : 'Pembayaran Terverifikasi'}
              </h2>
              <p className="mt-1 text-xs font-bold tracking-[0.12em] uppercase text-[#059669]">
                Lunas — Tercatat di Buku Kas Keuangan
              </p>
              <p className="mt-1 text-[11px] text-[#78716C]">{invoiceDate}</p>
            </div>

            <div className="px-7 sm:px-8 py-6 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-[#A8A29E]">Invoice</p>
                  <p className="font-mono text-sm font-bold text-[#1C1917]">{orderNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-[#A8A29E]">Metode</p>
                  <p className="text-xs font-semibold text-[#1C1917]">{methodLabel(paymentMethod)}</p>
                </div>
              </div>

              <div className="rounded-xl border border-[#E5E2DC] overflow-hidden">
                <div className="px-4 py-3 bg-[#FAF9F6] flex justify-between text-xs">
                  <span className="text-[#78716C]">Total Dibayar</span>
                  <span className="font-mono font-extrabold text-[#1C1917]">{formatRupiah(totalAmount)}</span>
                </div>
                <div className="px-4 py-2.5 flex justify-between text-[11px] border-t border-[#E5E2DC]">
                  <span className="text-[#78716C]">Rekening Merchant</span>
                  <span className="font-semibold text-[#1C1917] text-right">
                    ERNEST WILLIAM IMANUEL HU
                    <br />
                    <span className="font-normal text-[#78716C]">NMID: ID102661575001</span>
                  </span>
                </div>
                <div className="px-4 py-2 flex justify-between text-[11px] border-t border-[#E5E2DC] bg-[#FEF3C7]/30">
                  <span className="text-[#92400E] font-semibold">Status Pembayaran</span>
                  <span className="font-bold text-[#059669]">Terverifikasi (PAID)</span>
                </div>
              </div>

              <p className="text-center text-[11px] leading-relaxed text-[#78716C]">
                Pesanan sedang diproses di dapur dan siap dikirimkan sesuai alamat pesanan.
              </p>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    const w = window.open('', '_blank')
                    if (!w) return
                    w.document.write(
                      `<html><head><title>Invoice ${orderNumber}</title><style>body{font-family:system-ui;padding:32px;color:#1C1917} table{width:100%;border-collapse:collapse} td,th{border:1px solid #E5E2DC;padding:8px;font-size:13px} .t{font-weight:800}</style></head><body><h1>Tahu Sumedang — Invoice</h1><p>Invoice: <b>${orderNumber}</b><br/>Metode: ${methodLabel(
                        paymentMethod
                      )}<br/>Total: ${formatRupiah(totalAmount)}</p><p>Merchant: ERNEST WILLIAM IMANUEL HU (NMID: ID102661575001)</p><script>window.print(); window.onafterprint=()=>window.close()</script></body></html>`
                    )
                    w.document.close()
                  }}
                  className="flex-1 py-3 bg-white border border-[#E5E2DC] text-[#1C1917] text-xs font-bold rounded-xl hover:bg-[#F3F1ED] transition"
                >
                  Cetak Invoice
                </button>
                <Link
                  href="/profile"
                  className="flex-1 py-3 bg-[#D97706] hover:bg-[#B45309] text-white text-xs font-bold rounded-xl shadow-[0_4px_14px_rgba(217,119,6,0.2)] flex items-center justify-center transition"
                >
                  Pesanan Saya
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* UNPAID / WAITING VERIFICATION STATE */
          <div className="overflow-y-auto p-6 sm:p-7 text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full flex items-center justify-center border bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-[#1C1917]">
                {status === 'WAITING_VERIFICATION' ? 'Bukti Bayar Terkirim' : 'Menunggu Pembayaran'}
              </h2>
              <p className="mt-1 text-xs text-[#78716C]">
                {status === 'WAITING_VERIFICATION'
                  ? 'Bukti transfer Anda sudah diterima dan sedang diverifikasi oleh Tim Finance.'
                  : isQris
                    ? 'Scan QRIS berikut dengan BCA Mobile, GoPay, OVO, Dana, atau m-Banking Anda.'
                    : isTransferBca
                      ? 'Transfer manual ke Rekening BCA di bawah dan unggah bukti transfer screenshot.'
                      : 'Pesanan COD diproses, bayar saat pesanan tiba.'}
              </p>
            </div>

            {/* Status Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]">
              <span className="w-2 h-2 rounded-full bg-[#D97706] animate-pulse" />
              {status === 'WAITING_VERIFICATION' ? 'Menunggu Verifikasi Finance' : 'Belum Dibayar (UNPAID)'}
            </div>

            {/* QR / Payment Box */}
            <div className="p-4 bg-[#FAF9F6] border border-[#E5E2DC] rounded-xl text-left space-y-3">
              {isQris && (
                <div className="text-center space-y-2">
                  <div className="inline-block p-3 bg-white border border-[#E5E2DC] rounded-2xl shadow-sm">
                    {qrSvg ? (
                      <div
                        className="w-[200px] h-[200px] mx-auto [&>svg]:w-full [&>svg]:h-full"
                        dangerouslySetInnerHTML={{ __html: qrSvg }}
                      />
                    ) : (
                      <div className="w-[200px] h-[200px] flex items-center justify-center text-xs text-[#78716C]">
                        Membuat QRIS...
                      </div>
                    )}
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-[#1C1917]">ERNEST WILLIAM IMANUEL HU</p>
                    <p className="text-[11px] text-[#78716C] font-mono">NMID: ID102661575001</p>
                  </div>
                </div>
              )}

              {isTransferBca && (
                <div className="space-y-1.5">
                  <p className="text-[11px] font-bold tracking-[0.1em] uppercase text-[#78716C]">
                    Nomor Rekening Bank BCA
                  </p>
                  <div className="p-3 bg-white border border-[#E5E2DC] rounded-xl space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <span className="font-mono text-base font-extrabold tracking-wider text-[#1C1917]">
                          5020348994
                        </span>
                        <p className="text-[11px] text-[#78716C]">Bank Central Asia (BCA)</p>
                      </div>
                      <button
                        onClick={() => copy('5020348994')}
                        className="text-xs px-3 py-1.5 rounded-full border border-[#E5E2DC] bg-[#FAF9F6] hover:bg-white font-semibold"
                      >
                        {copied ? '✓ Tersalin' : 'Salin Rek'}
                      </button>
                    </div>
                    <div className="pt-2 border-t border-[#F0EDE8] flex justify-between items-center text-[11px]">
                      <span className="text-[#78716C]">Atas Nama:</span>
                      <span className="font-bold text-[#1C1917]">ERNEST WILLIAM IMANUEL HU</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Locked Nominal */}
              <div className="p-3 bg-white border border-[#E5E2DC] rounded-xl flex justify-between items-center">
                <span className="text-xs font-semibold text-[#78716C]">Nominal</span>
                <span className="text-base font-extrabold font-mono text-[#D97706]">
                  {formatRupiah(totalAmount)}
                </span>
              </div>

              <div className="flex justify-between text-[11px] text-[#78716C]">
                <span>
                  No. Pesanan: <b className="font-mono text-[#1C1917]">{orderNumber}</b>
                </span>
                <button onClick={() => copy(orderNumber)} className="underline decoration-dotted text-[#D97706]">
                  Salin Ref
                </button>
              </div>
            </div>

            {/* Payment Proof Upload Section */}
            <div className="p-4 bg-white border border-[#E5E2DC] rounded-xl text-left space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#1C1917]">Bukti Transfer / Pembayaran</span>
                {proofUrl && (
                  <span className="text-[11px] font-semibold text-[#059669] bg-[#D1FAE5] px-2 py-0.5 rounded-md">
                    ✓ Sudah Diunggah
                  </span>
                )}
              </div>

              {proofUrl ? (
                <div className="space-y-2">
                  <div className="relative rounded-lg overflow-hidden border border-[#E5E2DC] max-h-36 bg-[#FAF9F6]">
                    <img
                      src={proofUrl}
                      alt="Bukti Transfer"
                      className="w-full h-36 object-contain"
                    />
                  </div>
                  <p className="text-[11px] text-[#78716C]">
                    Bukti berhasil terkirim. Anda dapat mengunggah ulang jika terdapat revisi screenshot:
                  </p>
                </div>
              ) : previewUrl ? (
                <div className="space-y-2">
                  <div className="relative rounded-lg overflow-hidden border border-[#E5E2DC] max-h-36 bg-[#FAF9F6]">
                    <img
                      src={previewUrl}
                      alt="Preview Bukti"
                      className="w-full h-36 object-contain"
                    />
                  </div>
                </div>
              ) : null}

              <div className="space-y-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 py-2 px-3 bg-[#FAF9F6] border border-[#D6D3D1] hover:border-[#D97706] text-xs font-semibold rounded-lg text-[#1C1917] flex items-center justify-center gap-1.5 transition"
                  >
                    <svg className="w-4 h-4 text-[#78716C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    {selectedFile ? selectedFile.name.slice(0, 20) + '...' : 'Pilih Screenshot Bukti'}
                  </button>

                  <button
                    type="button"
                    onClick={handleUploadProof}
                    disabled={!selectedFile || isUploading}
                    className="py-2 px-4 bg-[#1C1917] hover:bg-[#292524] text-white text-xs font-bold rounded-lg disabled:opacity-40 transition active:scale-95"
                  >
                    {isUploading ? 'Mengunggah...' : 'Kirim Bukti'}
                  </button>
                </div>

                <p className="text-[10px] text-[#A8A29E]">
                  Format JPG, PNG, atau WebP maks 10MB. Setelah dikirim, order masuk antrean rekonsiliasi Finance.
                </p>
              </div>

              {msg && (
                <div
                  className={`p-2.5 rounded-lg text-xs font-semibold text-center ${msg.ok
                    ? 'bg-[#D1FAE5] text-[#065F46] border border-[#A7F3D0]'
                    : 'bg-red-50 text-[#991B1B] border border-red-200'
                    }`}
                >
                  {msg.text}
                </div>
              )}
            </div>

            {/* Status Information */}
            <div className="p-3 bg-[#FAF9F6] border border-[#E5E2DC] rounded-xl text-left">
              <p className="text-[11px] text-[#57534E] leading-relaxed">
                Pesanan Anda telah tercatat dalam sistem operasional. Anda dapat memantau perkembangan status pesanan kapan saja melalui menu <strong>Pesanan Saya</strong>.
              </p>
            </div>

            <div className="space-y-2 pt-1">
              <Link
                href="/profile"
                className="w-full py-3 bg-[#D97706] hover:bg-[#B45309] text-white text-xs font-bold rounded-xl shadow-[0_4px_14px_rgba(217,119,6,0.25)] flex items-center justify-center transition cursor-pointer"
              >
                Lihat Status di Pesanan Saya
              </Link>
              <button
                onClick={onClose}
                className="w-full py-2.5 bg-[#FAF9F6] border border-[#E5E2DC] text-xs font-semibold rounded-xl hover:bg-white text-[#57534E] transition cursor-pointer"
              >
                Tutup Jendela Ini
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
