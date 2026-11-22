'use client'
import { useState, useTransition } from 'react'
import { formatRupiah } from '@/lib/utils'
import { updateUserSalary, payPayroll, deletePayroll } from '@/lib/actions'

type StaffUser = { id: number; name: string; email: string; role: string; baseSalary: number | null; phone: string | null }
type Pay = { id: string; amount: number; month: string; status: string; paidAt: Date; user: StaffUser | null; employee: { name: string; position: string } | null }

export function PayrollManager({ staffUsers, payrolls }: { staffUsers: StaffUser[]; payrolls: Pay[] }) {
  const [pending, start] = useTransition()
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null)
  const [filter, setFilter] = useState('')
  const [editSalary, setEditSalary] = useState<Record<number, string>>({})

  const toast = (text: string, ok = true) => { setMsg({ text, ok }); setTimeout(() => setMsg(null), 3500) }

  const handleSalarySave = (userId: number) => {
    const val = editSalary[userId]
    if (val === undefined || val === '') { toast('Isi gaji dulu', false); return }
    const fd = new FormData()
    fd.set('baseSalary', val)
    start(async () => {
      const r = await updateUserSalary(userId, fd)
      toast(r.message, r.success)
      if (r.success) setEditSalary(s => { const n = { ...s }; delete n[userId]; return n })
    })
  }

  const handlePay = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const f = e.currentTarget
    start(async () => {
      const r = await payPayroll(fd)
      toast(r.message, r.success)
      if (r.success) f.reset()
    })
  }

  const filteredPay = payrolls.filter(p => {
    if (!filter) return true
    const name = p.user?.name ?? p.employee?.name ?? ''
    return p.month.includes(filter) || name.toLowerCase().includes(filter.toLowerCase())
  })

  const monthNow = new Date().toISOString().slice(0, 7)
  const bebanBulanIni = payrolls.filter(p => p.month === monthNow).reduce((s, p) => s + p.amount, 0)

  return (
    <div className="space-y-6">
      {msg && <div className={`p-3 rounded-xl text-xs font-semibold border ${msg.ok ? 'bg-[#D1FAE5] border-[#A7F3D0] text-[#065F46]' : 'bg-red-50 border-red-200 text-[#DC2626]'}`}>{msg.text}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white border border-[#E5E2DC] rounded-2xl shadow-xs">
          <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-[#78716C]">Karyawan</span>
          <span className="block text-2xl font-extrabold text-[#1C1917] mt-1">{staffUsers.length}</span>
        </div>
        <div className="p-4 bg-white border border-[#E5E2DC] rounded-2xl shadow-xs">
          <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-[#78716C]">Beban Bulan Ini</span>
          <span className="block text-lg font-extrabold text-[#DC2626] mt-1 break-all">{formatRupiah(bebanBulanIni)}</span>
          <span className="text-xs text-[#78716C]">{new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</span>
        </div>
        <div className="p-4 bg-[#FEF3C7]/40 border border-[#FDE68A] rounded-2xl shadow-xs">
          <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-[#92400E]">Total Penyaluran</span>
          <span className="block text-lg font-extrabold text-[#92400E] mt-1 break-all">{formatRupiah(payrolls.reduce((s, p) => s + p.amount, 0))}</span>
          <span className="text-xs text-[#92400E]/70">{payrolls.length} transaksi</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7">
          <div className="p-5 bg-white border border-[#E5E2DC] rounded-2xl shadow-xs space-y-3">
            <div>
              <h3 className="text-sm font-extrabold text-[#1C1917]">Karyawan</h3>
            </div>
            {staffUsers.length === 0 ? <p className="text-xs text-[#78716C] py-8 text-center border border-dashed border-[#E5E2DC] rounded-xl">Belum ada karyawan</p> : (
              <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
                {staffUsers.map(u => (
                  <div key={u.id} className="p-3.5 bg-[#FAF9F6] border border-[#E5E2DC] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#1C1917] truncate">{u.name}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${u.role === 'FINANCE' ? 'bg-[#D1FAE5] text-[#065F46] border-[#A7F3D0]' : u.role === 'OWNER' || u.role === 'SUPERADMIN' ? 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]' : 'bg-white text-[#57534E] border-[#E5E2DC]'}`}>{u.role}</span>
                      </div>
                      <span className="block text-[11px] text-[#78716C] truncate">{u.email} {u.phone ? `· ${u.phone}` : ''}</span>
                      <span className="block text-xs font-mono font-bold text-[#1C1917] mt-1">{u.baseSalary ? formatRupiah(u.baseSalary) : <span className="text-[#DC2626]">Belum diatur</span>}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 w-full sm:w-auto">
                      <input type="number" min={0} placeholder="Gaji" value={editSalary[u.id] ?? ''} onChange={e => setEditSalary(s => ({ ...s, [u.id]: e.target.value }))} className="flex-1 sm:w-32 h-9 px-3 bg-white border border-[#D6D3D1] rounded-lg text-xs font-mono text-[#1C1917] focus:border-[#D97706] focus:outline-none" />
                      <button disabled={pending} onClick={() => handleSalarySave(u.id)} className="h-9 px-3 bg-[#D97706] hover:bg-[#B45309] text-white text-xs font-bold rounded-lg disabled:opacity-40 shrink-0">Simpan</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-5 space-y-4">
          <form onSubmit={handlePay} className="p-5 bg-white border border-[#E5E2DC] rounded-2xl shadow-xs space-y-3">
            <h3 className="text-sm font-extrabold text-[#1C1917]">Penggajian</h3>
            <div><label className="block text-xs font-bold text-[#1C1917] mb-1">Karyawan *</label>
              <select name="userId" required className="w-full h-10 px-3 bg-[#FAF9F6] border border-[#D6D3D1] rounded-xl text-xs font-semibold text-[#1C1917]">
                {staffUsers.length === 0 ? <option value="">— Belum ada karyawan —</option> : staffUsers.map(u => <option key={u.id} value={u.id}>{u.name} — {u.role} {u.baseSalary ? `(${formatRupiah(u.baseSalary)})` : '(gaji belum diatur)'}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-bold text-[#1C1917] mb-1">Bulan *</label><input name="month" required placeholder="2026-10" defaultValue={new Date().toISOString().slice(0, 7)} pattern="\d{4}-\d{2}" className="w-full h-10 px-3.5 bg-[#FAF9F6] border border-[#D6D3D1] rounded-xl text-xs font-mono text-[#1C1917]" /></div>
              <div><label className="block text-xs font-bold text-[#1C1917] mb-1">Nominal</label><input name="amount" type="number" min={1} placeholder="otomatis" className="w-full h-10 px-3.5 bg-[#FAF9F6] border border-[#D6D3D1] rounded-xl text-xs font-mono text-[#1C1917]" /></div>
            </div>
            <button type="submit" disabled={pending || staffUsers.length === 0} className="w-full h-11 bg-[#1C1917] hover:bg-[#292524] text-white text-xs font-bold rounded-xl shadow-xs transition active:scale-95 disabled:opacity-40">Bayar & Catat</button>
          </form>

          <div className="p-5 bg-white border border-[#E5E2DC] rounded-2xl shadow-xs space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-xs font-extrabold tracking-wider uppercase text-[#1C1917]">Riwayat ({filteredPay.length})</h3>
              <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Filter bulan/nama…" className="h-8 px-3 bg-[#FAF9F6] border border-[#E5E2DC] rounded-full text-xs w-36 focus:border-[#D97706] focus:outline-none" />
            </div>
            {filteredPay.length === 0 ? <p className="text-xs text-[#78716C] py-8 text-center border border-dashed border-[#E5E2DC] rounded-xl">Belum ada riwayat</p> : (
              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {filteredPay.slice(0, 80).map(p => {
                  const name = p.user?.name ?? p.employee?.name ?? '—'
                  const role = p.user?.role ?? p.employee?.position ?? '—'
                  return (
                    <div key={p.id} className="p-3 bg-[#FAF9F6] border border-[#E5E2DC] rounded-xl flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <span className="block text-xs font-bold text-[#1C1917] truncate">{name} · {role}</span>
                        <span className="block text-[11px] text-[#78716C]">{p.month} · {new Date(p.paidAt).toLocaleDateString('id-ID')} · <span className="px-1.5 py-0.5 bg-[#D1FAE5] text-[#065F46] rounded-full text-[10px] font-bold">{p.status}</span></span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-mono font-extrabold text-[#1C1917]">{formatRupiah(p.amount)}</span>
                        <button disabled={pending} onClick={() => { if (!confirm('Hapus riwayat?')) return; start(async () => { const r = await deletePayroll(p.id); toast(r.message, r.success) }) }} className="text-[11px] font-semibold text-[#DC2626] border border-red-200 px-2 py-1 rounded-lg hover:bg-red-50">Hapus</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
