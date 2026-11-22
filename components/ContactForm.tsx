'use client'

import { useState } from 'react'

const WA_NUMBER = '6285889191659'
const SUBJECTS = ['Pertanyaan Produk', 'Status Pesanan', 'Pengiriman & Ongkir', 'Kerja Sama / Reseller', 'Lainnya']

export function ContactForm() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [subject, setSubject] = useState(SUBJECTS[0])
  const [message, setMessage] = useState('')
  const [error, setError] = useState<string | null>(null)

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    if (!name.trim() || !message.trim()) {
      setError('Nama dan pesan wajib diisi.')
      return
    }
    if (message.trim().length < 10) {
      setError('Pesan minimal 10 karakter agar kami dapat membantu dengan tepat.')
      return
    }

    const text = [
      `Halo Tahu Sumedang, saya ${name.trim()}.`,
      phone.trim() ? `No. WhatsApp: ${phone.trim()}` : null,
      `Topik: ${subject}`,
      '',
      message.trim(),
    ]
      .filter(Boolean)
      .join('\n')

    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="contact-name" className="block text-xs font-bold text-[#1C1917] mb-1.5">
            Nama Lengkap <span className="text-[#DC2626]">*</span>
          </label>
          <input
            id="contact-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Nama Anda"
            className="w-full h-11 px-3.5 bg-[#FAF9F6] border border-[#D6D3D1] rounded-xl text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:bg-white focus:border-[#D97706] focus:outline-none focus:ring-[3px] focus:ring-[#D97706]/10 transition-all"
          />
        </div>
        <div>
          <label htmlFor="contact-phone" className="block text-xs font-bold text-[#1C1917] mb-1.5">
            No. WhatsApp
          </label>
          <input
            id="contact-phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            inputMode="tel"
            placeholder="08xxxxxxxxxx"
            className="w-full h-11 px-3.5 bg-[#FAF9F6] border border-[#D6D3D1] rounded-xl text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:bg-white focus:border-[#D97706] focus:outline-none focus:ring-[3px] focus:ring-[#D97706]/10 transition-all"
          />
        </div>
      </div>

      <div>
        <label htmlFor="contact-subject" className="block text-xs font-bold text-[#1C1917] mb-1.5">
          Topik Pertanyaan
        </label>
        <select
          id="contact-subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full h-11 px-3.5 bg-[#FAF9F6] border border-[#D6D3D1] rounded-xl text-sm text-[#1C1917] focus:bg-white focus:border-[#D97706] focus:outline-none focus:ring-[3px] focus:ring-[#D97706]/10 transition-all cursor-pointer"
        >
          {SUBJECTS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="contact-message" className="block text-xs font-bold text-[#1C1917] mb-1.5">
          Pesan <span className="text-[#DC2626]">*</span>
        </label>
        <textarea
          id="contact-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={5}
          placeholder="Tuliskan pertanyaan atau kebutuhan Anda secara detail…"
          className="w-full p-3.5 bg-[#FAF9F6] border border-[#D6D3D1] rounded-xl text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:bg-white focus:border-[#D97706] focus:outline-none focus:ring-[3px] focus:ring-[#D97706]/10 transition-all resize-none"
        />
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-[#991B1B] animate-slide-up">
          {error}
        </div>
      )}

      <button
        type="submit"
        className="w-full h-12 bg-[#D97706] hover:bg-[#B45309] text-white text-sm font-bold rounded-xl shadow-[0_4px_14px_rgba(217,119,6,0.25)] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.05-.52-.099-.148-.669-1.611-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
        Kirim via WhatsApp
      </button>

      <p className="text-[11px] text-[#78716C] text-center leading-relaxed">
        Pesan akan dibuka di WhatsApp dengan detail yang sudah terisi otomatis. Kami membalas pada jam
        operasional 06:00 – 21:00 WIB.
      </p>
    </form>
  )
}

