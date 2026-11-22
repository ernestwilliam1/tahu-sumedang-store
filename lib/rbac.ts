import type { Role } from '@/lib/auth'

export const ALL_ROLES: Role[] = ['SUPERADMIN', 'OWNER', 'ADMIN', 'STAFF', 'SUPPLIER', 'FINANCE', 'CUSTOMER']

export const ROLE_LABEL: Record<Role, string> = {
  SUPERADMIN: 'Superadmin',
  OWNER: 'Owner',
  ADMIN: 'Admin',
  STAFF: 'Staff',
  SUPPLIER: 'Supplier',
  FINANCE: 'Finance',
  CUSTOMER: 'Pelanggan',
}

export type DashboardKey = 'admin' | 'supplier' | 'finance' | 'customer'

export const ROLE_DASHBOARD: Record<Role, DashboardKey | 'all'> = {
  SUPERADMIN: 'all',
  OWNER: 'all',
  ADMIN: 'admin',
  STAFF: 'admin',
  SUPPLIER: 'supplier',
  FINANCE: 'finance',
  CUSTOMER: 'customer',
}

export const DASHBOARD_ROLES: Record<DashboardKey, Role[]> = {
  admin: ['SUPERADMIN', 'OWNER', 'ADMIN', 'STAFF'],
  supplier: ['SUPERADMIN', 'OWNER', 'SUPPLIER'],
  finance: ['SUPERADMIN', 'OWNER', 'FINANCE'],
  customer: ['SUPERADMIN', 'OWNER', 'CUSTOMER'],
}

export function canAccessDashboard(role: Role, key: DashboardKey): boolean {
  if (role === 'SUPERADMIN' || role === 'OWNER') return true
  return DASHBOARD_ROLES[key].includes(role)
}

export const VA_BANKS = [
  { id: 'VA_BCA', label: 'BCA Virtual Account', short: 'BCA', color: '#0060af' },
  { id: 'VA_MANDIRI', label: 'Mandiri Virtual Account', short: 'Mandiri', color: '#003d79' },
  { id: 'VA_BNI', label: 'BNI Virtual Account', short: 'BNI', color: '#ff6600' },
  { id: 'VA_BRI', label: 'BRI Virtual Account', short: 'BRI', color: '#00529c' },
] as const

export const PAYMENT_METHODS = [
  ...VA_BANKS.map((b) => ({ id: b.id, label: b.label, group: 'VA' as const })),
  { id: 'QRIS', label: 'QRIS', group: 'QRIS' as const },
  { id: 'RETAIL_INDOMARET', label: 'Indomaret', group: 'RETAIL' as const },
  { id: 'RETAIL_ALFAMART', label: 'Alfamart', group: 'RETAIL' as const },
  { id: 'COD', label: 'Bayar di Tempat (COD)', group: 'COD' as const },
]
