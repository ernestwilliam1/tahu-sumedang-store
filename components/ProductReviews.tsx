'use client'
import { useState, useTransition, useEffect } from 'react'
import { submitReview, getProductReviews } from '@/lib/actions'

type ReviewRow = { id: string; rating: number; comment: string | null; createdAt: Date; userName: string; verified: boolean }

export function ProductReviews({ productId, productName }: { productId: number; productName: string }) {
  const [reviews, setReviews] = useState<ReviewRow[]>([])
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
  const [pending, start] = useTransition()

  const load = async () => {
    const r = await getProductReviews(productId)
    setReviews(r)
  }
  useEffect(() => { load() }, [productId])

  const onSubmit = () => {
    start(async () => {
      const res = await submitReview(productId, rating, comment)
      setMsg(res.message)
      setTimeout(() => setMsg(null), 3000)
      if (res.success) { setComment(''); load() }
    })
  }

  return (
    <div className="space-y-4 pt-6 border-t border-[#E5E2DC]">
      <h3 className="text-sm font-extrabold text-[#1C1917]">Ulasan Pelanggan</h3>
      <p className="text-xs text-[#78716C]">{reviews.length} ulasan untuk {productName}</p>

      <div className="p-4 bg-[#FAF9F6] border border-[#E5E2DC] rounded-xl space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#1C1917]">Rating:</span>
          <div className="flex gap-1">
            {[1,2,3,4,5].map(n => (
              <button key={n} onClick={() => setRating(n)} className={`w-8 h-8 rounded-lg border text-sm font-bold ${rating >= n ? 'bg-[#D97706] text-white border-[#D97706]' : 'bg-white text-[#78716C] border-[#E5E2DC]'}`}>★</button>
            ))}
          </div>
          <span className="text-xs font-mono font-bold text-[#D97706]">{rating}/5</span>
        </div>
        <textarea value={comment} onChange={e => setComment(e.target.value)} rows={2} placeholder="Tulis pengalaman rasa, tekstur, porsi…" className="w-full p-3 bg-white border border-[#D6D3D1] rounded-xl text-xs text-[#1C1917] focus:border-[#D97706] focus:outline-none resize-none" />
        <button onClick={onSubmit} disabled={pending} className="px-4 py-2 bg-[#1C1917] hover:bg-[#292524] text-white text-xs font-bold rounded-xl disabled:opacity-40">{pending ? 'Mengirim…' : 'Kirim Ulasan'}</button>
        {msg && <p className="text-xs font-semibold text-[#065F46]">{msg}</p>}
        <p className="text-[11px] text-[#A8A29E]">Login diperlukan. Ulasan dari pembeli lunas akan bertanda ✓ Terverifikasi.</p>
      </div>

      <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
        {reviews.length === 0 ? <p className="text-xs text-[#78716C] py-6 text-center border border-dashed border-[#E5E2DC] rounded-xl">Belum ada ulasan — jadilah yang pertama!</p> : reviews.map(r => (
          <div key={r.id} className="p-3 bg-white border border-[#E5E2DC] rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#1C1917]">{r.userName} {r.verified && <span className="ml-1 px-1.5 py-0.5 bg-[#D1FAE5] text-[#065F46] rounded text-[10px]">✓ Terverifikasi</span>}</span>
              <span className="text-xs font-mono font-bold text-[#D97706]">{'★'.repeat(r.rating)}<span className="text-[#E5E2DC]">{'★'.repeat(5-r.rating)}</span></span>
            </div>
            {r.comment && <p className="text-xs text-[#57534E] mt-1.5 leading-relaxed">{r.comment}</p>}
            <span className="block text-[11px] text-[#A8A29E] mt-1">{new Date(r.createdAt).toLocaleString('id-ID')}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
