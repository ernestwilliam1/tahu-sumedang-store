// Shared types derived from Prisma schema, used across components.
// Keeps client components independent of @prisma/client.

export interface Product {
  id: number
  name: string
  slug: string | null
  category: string
  price: number
  originalPrice: number | null
  stock: number
  soldCount: number
  rating: number
  reviewCount: number
  description: string | null
  image: string | null
  badge: string | null
  isFlashSale: boolean
  isPopular: boolean
  createdAt: Date
}

export interface CartItem {
  productId: number
  name: string
  price: number
  quantity: number
  image: string | null
}

export interface OrderData {
  orderNumber: string
  customerName: string
  totalAmount: number
  status: string
}

export type PaymentMethodId =
  | 'COD'
  | 'TRANSFER_BANK'
  | 'VA_BCA'
  | 'VA_BRI'
  | 'VA_BNI'
  | 'VA_BSI'
  | 'QRIS'

export type OrderStatus =
  | 'PENDING'
  | 'AWAITING_PAYMENT'
  | 'PAID'
  | 'PROCESSING'
  | 'PACKED'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED'

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'EXPIRED' | 'UNPAID'
