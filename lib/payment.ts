import { STORE_OPERATIONAL_ACCOUNT, STORE_QRIS_MERCHANT } from '@/lib/storeAccount'
import { generateDynamicQRIS } from '@/lib/qris'

export const BCA_ACCOUNT = STORE_OPERATIONAL_ACCOUNT.accountNumber
export const BCA_LABEL = `${STORE_OPERATIONAL_ACCOUNT.bank} — ${STORE_OPERATIONAL_ACCOUNT.accountNumber} a.n. ${STORE_OPERATIONAL_ACCOUNT.accountName}`

export function isTransferBca(m: string): boolean {
  return m === 'TRANSFER_BCA' || m === 'VA_BCA'
}

export function generateQrisPayload(orderNumber: string, amount: number = 0): string {
  return generateDynamicQRIS(amount, orderNumber)
}
