'use client'
import { useEffect, useState } from 'react'
import { getLowStockAlerts } from '@/lib/actions'

export function StockAlerts({ threshold = 15 }: { threshold?: number }) {
  const [data, setData] = useState<{ products: { name: string; stock: number }[]; rawMaterials: { name: string; stock: number; unit: string }[] } | null>(null)
  useEffect(() => {
    getLowStockAlerts(threshold).then(setData).catch(() => {})
    const id = setInterval(() => getLowStockAlerts(threshold).then(setData).catch(() => {}), 60000)
    return () => clearInterval(id)
  }, [threshold])
  if (!data) return null
  const total = data.products.length + data.rawMaterials.length
  if (total === 0) return null
  return (
    <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
      <span className="w-8 h-8 rounded-full bg-[#FEF3C7] border border-[#FDE68A] flex items-center justify-center text-sm shrink-0">🔔</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-[#92400E]">Stok menipis — {total} item di bawah {threshold}</p>
        {data.products.length > 0 && <p className="text-[11px] text-[#92400E]/80 mt-1 truncate">Produk: {data.products.map(p => `${p.name} (${p.stock})`).join(' · ')}</p>}
        {data.rawMaterials.length > 0 && <p className="text-[11px] text-[#92400E]/80 truncate">Bahan: {data.rawMaterials.map(m => `${m.name} (${m.stock}${m.unit})`).join(' · ')}</p>}
      </div>
      <span className="px-2 py-1 bg-[#D97706] text-white text-[11px] font-bold rounded-full shrink-0">{total}</span>
    </div>
  )
}
