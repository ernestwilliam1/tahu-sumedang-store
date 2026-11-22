/** Centralized Store Operational Account — single source of truth for settlement destination */
export const STORE_OPERATIONAL_ACCOUNT = {
  bank: 'BCA' as const,
  bankLabel: 'Bank Central Asia (BCA)',
  accountNumber: '5020348994',
  accountName: 'ERNEST WILLIAM IMANUEL HU',
  branch: 'BCA KCU Jakarta',
} as const

export const STORE_QRIS_MERCHANT = {
  nmmId: 'ID102661575001',
  merchantName: 'ERNEST WILLIAM IMANUEL HU',
  city: 'JAKARTA TIMUR',
} as const
