'use client'
type Log = { id: string; role: string; action: string; message: string; createdAt: Date }
const roleColor: Record<string, string> = {
  OWNER: 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]',
  SUPERADMIN: 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]',
  ADMIN: 'bg-white text-[#57534E] border-[#E5E2DC]',
  STAFF: 'bg-white text-[#57534E] border-[#E5E2DC]',
  FINANCE: 'bg-[#D1FAE5] text-[#065F46] border-[#A7F3D0]',
  SUPPLIER: 'bg-[#E0F2FE] text-[#0C4A6E] border-[#BAE6FD]',
  CUSTOMER: 'bg-[#FAF9F6] text-[#78716C] border-[#E5E2DC]',
}
function timeAgo(d: Date) {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000)
  if (s < 60) return 'baru saja'
  if (s < 3600) return `${Math.floor(s / 60)}m lalu`
  if (s < 86400) return `${Math.floor(s / 3600)}j lalu`
  return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}
export function ActivityFeed({ logs, title = 'Aktivitas', subtitle = '' }: { logs: Log[]; title?: string; subtitle?: string }) {
  return (
    <div className="p-5 bg-white border border-[#E5E2DC] rounded-2xl shadow-[0_2px_8px_rgba(28,25,23,0.04)] space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-extrabold text-[#1C1917]">{title}</h3>
          {subtitle ? <p className="text-xs text-[#78716C]">{subtitle}</p> : null}
        </div>
        <span className="text-[11px] font-bold px-2.5 py-1 bg-[#F3F1ED] rounded-full text-[#57534E] border border-[#E5E2DC]">{logs.length} aktivitas</span>
      </div>
      {logs.length === 0 ? (
        <p className="text-xs text-[#78716C] py-8 text-center border border-dashed border-[#E5E2DC] rounded-xl">Belum ada aktivitas</p>
      ) : (
        <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
          {logs.map(l => (
            <div key={l.id} className="p-3 bg-[#FAF9F6] border border-[#E5E2DC] rounded-xl flex gap-3">
              <div className={`h-7 px-2.5 flex items-center rounded-full text-[10px] font-bold uppercase tracking-wider border shrink-0 mt-0.5 ${roleColor[l.role] ?? 'bg-white text-[#57534E] border-[#E5E2DC]'}`}>{l.role}</div>
              <div className="min-w-0 flex-1">
                <span className="block text-xs font-bold text-[#1C1917]">{l.action}</span>
                <span className="block text-xs text-[#57534E] mt-0.5 leading-snug break-words">{l.message}</span>
                <span className="block text-[11px] text-[#A8A29E] mt-1">{timeAgo(l.createdAt)} · {new Date(l.createdAt).toLocaleString('id-ID')}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
