'use client'

import { useState, useTransition } from 'react'
import { createAdminAccount, updateAdminAccount, deleteAdminAccount } from '@/lib/actions'

type U = { id: number; name: string; email: string; role: string; createdAt: Date }

const ROLES = ['ADMIN', 'STAFF', 'SUPPLIER', 'FINANCE'] as const

export function OwnerAdminsClient({ users }: { users: U[] }) {
  const [pending, start] = useTransition()
  const [msg, setMsg] = useState<{ text: string; err?: boolean } | null>(null)
  const [editing, setEditing] = useState<U | null>(null)

  const notify = (t: string, e?: boolean) => {
    setMsg({ text: t, err: e })
    setTimeout(() => setMsg(null), 4000)
  }

  const onCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const f = e.currentTarget
    start(async () => {
      const r = await createAdminAccount(fd)
      notify(r.message, !r.success)
      if (r.success) f.reset()
    })
  }

  const onUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editing) return
    const fd = new FormData(e.currentTarget)
    const data: Record<string, string> = {}
    const name = (fd.get('name') as string)?.trim()
    const email = (fd.get('email') as string)?.trim()
    const role = fd.get('role') as string
    const password = fd.get('password') as string
    if (name) data.name = name
    if (email) data.email = email
    if (role) data.role = role
    if (password) data.password = password
    start(async () => {
      const r = await updateAdminAccount(editing.id, data)
      notify(r.message, !r.success)
      if (r.success) setEditing(null)
    })
  }

  const admins = users.filter((u) => !['CUSTOMER'].includes(u.role))

  return (
    <div className="space-y-4">
      {msg && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-semibold shadow-xs animate-slide-up ${
            msg.err
              ? 'bg-red-50 border-red-200 text-[#991B1B]'
              : 'bg-[#D1FAE5] border-[#A7F3D0] text-[#065F46]'
          }`}
        >
          {msg.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Create / Edit Form */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 sm:p-6 bg-white border border-[#E5E2DC] rounded-2xl shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-extrabold text-[#1C1917]">Tambah Akun Internal</h3>
              <p className="text-[11px] text-[#78716C] mt-0.5">
                Hak akses khusus Owner: ADMIN, STAFF, SUPPLIER, FINANCE
              </p>
            </div>

            <form onSubmit={onCreate} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-[#1C1917] mb-1">Nama Lengkap *</label>
                <input
                  name="name"
                  required
                  placeholder="Nama staf"
                  className="w-full h-10 px-3.5 bg-[#FAF9F6] border border-[#D6D3D1] rounded-lg text-xs text-[#1C1917] focus:border-[#D97706] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#1C1917] mb-1">Email Akun *</label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="staf@tahusumedang.local"
                  className="w-full h-10 px-3.5 bg-[#FAF9F6] border border-[#D6D3D1] rounded-lg text-xs text-[#1C1917] focus:border-[#D97706] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#1C1917] mb-1">Kata Sandi (min 6) *</label>
                <input
                  name="password"
                  type="password"
                  required
                  placeholder="Password"
                  className="w-full h-10 px-3.5 bg-[#FAF9F6] border border-[#D6D3D1] rounded-lg text-xs text-[#1C1917] focus:border-[#D97706] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#1C1917] mb-1">Peran Akses (Role) *</label>
                <select
                  name="role"
                  defaultValue="ADMIN"
                  className="w-full h-10 px-3.5 bg-[#FAF9F6] border border-[#D6D3D1] rounded-lg text-xs font-semibold text-[#1C1917] focus:border-[#D97706] focus:outline-none"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                disabled={pending}
                className="w-full h-10 bg-[#D97706] hover:bg-[#B45309] text-white text-xs font-bold rounded-lg shadow-xs transition active:scale-95 disabled:opacity-40"
              >
                {pending ? 'Menyimpan...' : 'Buat Akun Staf'}
              </button>
            </form>
          </div>

          {editing && (
            <div className="p-5 bg-[#FEF3C7]/60 border border-[#FDE68A] rounded-2xl space-y-3 animate-slide-up">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#92400E]">Edit Akun: {editing.name}</h4>
                <button
                  onClick={() => setEditing(null)}
                  className="text-[11px] text-[#92400E] font-bold hover:underline"
                >
                  Batal
                </button>
              </div>
              <form onSubmit={onUpdate} className="space-y-2.5">
                <input
                  name="name"
                  defaultValue={editing.name}
                  placeholder="Nama"
                  className="w-full h-9 px-3 bg-white border border-[#D6D3D1] rounded-lg text-xs text-[#1C1917] focus:outline-none"
                />
                <input
                  name="email"
                  defaultValue={editing.email}
                  placeholder="Email"
                  className="w-full h-9 px-3 bg-white border border-[#D6D3D1] rounded-lg text-xs text-[#1C1917] focus:outline-none"
                />
                <select
                  name="role"
                  defaultValue={editing.role}
                  className="w-full h-9 px-3 bg-white border border-[#D6D3D1] rounded-lg text-xs font-semibold text-[#1C1917]"
                >
                  {[...ROLES, 'CUSTOMER' as const].map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                <input
                  name="password"
                  type="password"
                  placeholder="Password baru (kosongkan jika tetap)"
                  className="w-full h-9 px-3 bg-white border border-[#D6D3D1] rounded-lg text-xs text-[#1C1917] focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={pending}
                  className="w-full h-9 bg-[#D97706] hover:bg-[#B45309] text-white text-xs font-bold rounded-lg transition"
                >
                  Simpan Perubahan
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Admin Staff List */}
        <div className="lg:col-span-8">
          <div className="p-5 sm:p-6 bg-white border border-[#E5E2DC] rounded-2xl shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-[#1C1917]">
                  Daftar Manajemen & Staf ({admins.length})
                </h3>
                <p className="text-xs text-[#78716C]">Akun dengan wewenang operasional sistem</p>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-1 bg-[#F3F1ED] rounded-full text-[#57534E]">
                Owner Protected
              </span>
            </div>

            <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
              {admins.map((u) => {
                const isProtected = ['SUPERADMIN', 'OWNER'].includes(u.role)
                return (
                  <div
                    key={u.id}
                    className="flex items-center justify-between gap-3 p-3.5 bg-[#FAF9F6] border border-[#E5E2DC] rounded-xl hover:border-[#D6D3D1] transition"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-[#1C1917] truncate">
                          {u.name}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border ${
                            u.role === 'OWNER' || u.role === 'SUPERADMIN'
                              ? 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]'
                              : u.role === 'FINANCE'
                              ? 'bg-[#D1FAE5] text-[#065F46] border-[#A7F3D0]'
                              : 'bg-white text-[#57534E] border-[#E5E2DC]'
                          }`}
                        >
                          {u.role}
                        </span>
                      </div>
                      <span className="block text-xs text-[#78716C] mt-0.5 truncate">{u.email}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {!isProtected ? (
                        <>
                          <button
                            onClick={() => setEditing(u)}
                            className="px-3 py-1.5 text-xs font-semibold border border-[#E5E2DC] rounded-lg bg-white hover:bg-[#F3F1ED] transition text-[#1C1917]"
                          >
                            Edit
                          </button>
                          <button
                            disabled={pending}
                            onClick={() => {
                              if (!confirm(`Hapus staf ${u.name}?`)) return
                              start(async () => {
                                const r = await deleteAdminAccount(u.id)
                                notify(r.message, !r.success)
                              })
                            }}
                            className="px-3 py-1.5 text-xs font-semibold border border-red-200 text-[#DC2626] rounded-lg hover:bg-red-50 transition disabled:opacity-40"
                          >
                            Hapus
                          </button>
                        </>
                      ) : (
                        <span className="text-[11px] font-semibold text-[#A8A29E] px-2 py-1 bg-[#F3F1ED] rounded-lg">
                          Utama
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
