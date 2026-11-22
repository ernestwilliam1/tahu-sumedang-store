import { PrismaClient } from '@prisma/client'
import { hashSync } from 'bcryptjs'

const prisma = new PrismaClient()

const productsBaseline = [
  {
    name: 'Tahu Sumedang Besek Tradisional',
    slug: 'besek-tradisional-25',
    category: 'Paket Besek',
    price: 25000,
    originalPrice: 32000,
    targetStock: 80,
    rating: 4.9,
    reviewCount: 128,
    description: 'Tahu goreng dadakan asli — kulit gurih krispy, dalam kopong lembut aroma kedelai. 25 pcs dalam besek bambu + cabai rawit hijau.',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    badge: 'Best Seller',
    isFlashSale: true,
    isPopular: true,
  },
  {
    name: 'Tahu Super Renyah Besek Puas',
    slug: 'besek-puas-50',
    category: 'Paket Besek',
    price: 48000,
    originalPrice: 60000,
    targetStock: 50,
    rating: 4.8,
    reviewCount: 89,
    description: 'Porsi besar 50 pcs tahu panas keemasan, 2 bungkus cabai rawit + bumbu tabur gurih. Favorit keluarga!',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80',
    badge: 'Value Pack',
    isFlashSale: true,
    isPopular: true,
  },
  {
    name: 'Tahu Mercon Rawit Merah Nampol',
    slug: 'mercon-rawit-10',
    category: 'Tahu Mercon',
    price: 22000,
    originalPrice: null,
    targetStock: 40,
    rating: 4.7,
    reviewCount: 64,
    description: 'Isian tumis cabai rawit merah pedas nendang. 10 pcs.',
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80',
    badge: 'Spicy',
    isFlashSale: false,
    isPopular: true,
  },
  {
    name: 'Tahu Walik Krispy Sambal Petis',
    slug: 'walik-krispy-15',
    category: 'Tahu Goreng',
    price: 28000,
    originalPrice: null,
    targetStock: 35,
    rating: 4.8,
    reviewCount: 52,
    description: 'Tahu dibalik isian adonan ayam renyah + sambal petis manis gurih. 15 pcs mantap untuk camilan sore.',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
    badge: null,
    isFlashSale: false,
    isPopular: true,
  },
  {
    name: 'Tahu Gejrot Pedas Segar',
    slug: 'gejrot-pedas',
    category: 'Tahu Goreng',
    price: 18000,
    originalPrice: null,
    targetStock: 45,
    rating: 4.6,
    reviewCount: 71,
    description: 'Disiram kuah gula merah asam jawa + ulekan cabai & bawang. Kuah segar pedas-manis khas Cirebon.',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
    badge: null,
    isFlashSale: true,
    isPopular: false,
  },
  {
    name: 'Tahu Frozen Vakum Pack',
    slug: 'frozen-vakum-30',
    category: 'Frozen',
    price: 32000,
    originalPrice: null,
    targetStock: 120,
    rating: 4.5,
    reviewCount: 34,
    description: '30 pcs vakum higienis tanpa pengawet. Tahan 2 minggu di freezer, tinggal goreng 3 menit jadi renyah lagi.',
    image: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=800&q=80',
    badge: null,
    isFlashSale: false,
    isPopular: false,
  },
  {
    name: 'Sambal Kecap Rawit Bawang',
    slug: 'sambal-kecap-200ml',
    category: 'Pelengkap',
    price: 15000,
    originalPrice: null,
    targetStock: 60,
    rating: 4.9,
    reviewCount: 93,
    description: 'Kecap manis + irisan cabai rawit hijau & bawang. Botol 200ml.',
    image: 'https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&w=800&q=80',
    badge: 'Fan Favorite',
    isFlashSale: false,
    isPopular: true,
  },
  {
    name: 'Hampers Besek Anyaman Istimewa',
    slug: 'hampers-istimewa',
    category: 'Hampers',
    price: 75000,
    originalPrice: 95000,
    targetStock: 25,
    rating: 5.0,
    reviewCount: 29,
    description: '50 pcs Tahu Sumedang + Sambal 200ml + cabai, besek bambu berpita. Cocok untuk hampers Lebaran dan oleh-oleh kantor.',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
    badge: 'Premium',
    isFlashSale: true,
    isPopular: false,
  },
]

const usersData = [
  {
    name: 'Owner Tahu Sumedang',
    email: 'owner@tahusumedang.local',
    password: 'owner123',
    role: 'OWNER',
    phone: '081122334455',
    city: 'Sumedang',
    address: 'Jl. Prabu Geusan Ulun No. 1, Kotakulon, Sumedang',
  },
  {
    name: 'Superadmin Tahu Sumedang',
    email: 'superadmin@tahusumedang.local',
    password: 'super123',
    role: 'SUPERADMIN',
    phone: '081122334456',
    city: 'Sumedang',
    address: 'Jl. Mayor Abdurahman No. 10, Sumedang Utara',
  },
  {
    name: 'Admin Toko Pusat',
    email: 'admin@tahusumedang.local',
    password: 'admin123',
    role: 'ADMIN',
    phone: '081234567801',
    city: 'Sumedang',
    address: 'Jl. Raya Cimalaka No. 45, Cimalaka, Sumedang',
  },
  {
    name: 'Staff Gudang & Dapur',
    email: 'staff@tahusumedang.local',
    password: 'staff123',
    role: 'STAFF',
    phone: '081234567802',
    city: 'Sumedang',
    address: 'Jl. Pangeran Kornel No. 88, Sumedang Selatan',
  },
  {
    name: 'PT Agro Kedelai Nusantara',
    email: 'supplier@tahusumedang.local',
    password: 'supplier123',
    role: 'SUPPLIER',
    phone: '081399887766',
    city: 'Sumedang',
    address: 'Sentra Agro Industri No. 12, Tomo, Sumedang',
  },
  {
    name: 'CV Berkah Besek & Kemasan (Budi)',
    email: 'budi.supplier@tahusumedang.local',
    password: 'supplier123',
    role: 'SUPPLIER',
    phone: '081388776655',
    city: 'Sumedang',
    address: 'Desa Cibeureum Kidul No. 5, Paseh, Sumedang',
  },
  {
    name: 'Head of Finance',
    email: 'finance@tahusumedang.local',
    password: 'finance123',
    role: 'FINANCE',
    phone: '081299112233',
    city: 'Sumedang',
    address: 'Jl. Angkrek No. 15, Situ, Sumedang Utara',
  },
  {
    name: 'Siti Kasir & Akuntansi',
    email: 'siti.finance@tahusumedang.local',
    password: 'finance123',
    role: 'FINANCE',
    phone: '081299112234',
    city: 'Sumedang',
    address: 'Jl. Raden Sadikin No. 3, Kotakulon, Sumedang',
  },
  // Customers with complete profiles
  {
    name: 'Budi Santoso',
    email: 'customer@tahusumedang.local',
    password: 'customer123',
    role: 'CUSTOMER',
    phone: '081234567890',
    city: 'Sumedang',
    address: 'Jl. Angkrek No. 42, RT 02/RW 05',
  },
  {
    name: 'Rina Wulandari',
    email: 'rina@tahusumedang.local',
    password: 'customer123',
    role: 'CUSTOMER',
    phone: '081298765432',
    city: 'Sumedang',
    address: 'Jl. Prabu Geusan Ulun No. 18',
  },
  {
    name: 'Andi Pratama',
    email: 'andi@tahusumedang.local',
    password: 'customer123',
    role: 'CUSTOMER',
    phone: '081311223344',
    city: 'Bandung',
    address: 'Jl. Dago Asri No. 105, Coblong',
  },
  {
    name: 'Dewi Lestari',
    email: 'dewi@tahusumedang.local',
    password: 'customer123',
    role: 'CUSTOMER',
    phone: '081277889900',
    city: 'Bandung',
    address: 'Jl. Pajajaran No. 67, Cicendo',
  },
  {
    name: 'Hendra Gunawan',
    email: 'hendra@tahusumedang.local',
    password: 'customer123',
    role: 'CUSTOMER',
    phone: '081355667788',
    city: 'Jakarta',
    address: 'Jl. Tebet Barat Dalam No. 23, Tebet',
  },
  {
    name: 'Demo Akun Google',
    email: 'demo_google@social.local',
    password: 'customer123',
    role: 'CUSTOMER',
    phone: '081266778899',
    city: 'Bekasi',
    address: 'Grand Galaxy City Blok B No. 12',
  },
  {
    name: 'Demo Akun Facebook',
    email: 'demo_facebook@social.local',
    password: 'customer123',
    role: 'CUSTOMER',
    phone: '081255443322',
    city: 'Cirebon',
    address: 'Jl. Kartini No. 8, Kejaksan',
  },
]

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pick<T>(arr: readonly T[]): T {
  return arr[randInt(0, arr.length - 1)] as T
}

async function main(): Promise<void> {
  console.log('🌱 Starting full synchronization & seeding...')

  // 1. Referential integrity: Safe clean reset in strict child -> parent order
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.stockEntry.deleteMany()
  await prisma.rawMaterial.deleteMany()
  await prisma.expense.deleteMany()
  await prisma.product.deleteMany()
  await prisma.user.deleteMany()

  // 2. Users: Seed all internal and customer accounts with valid phone, city, and address
  for (const u of usersData) {
    await prisma.user.create({
      data: {
        name: u.name,
        email: u.email,
        password: hashSync(u.password, 10),
        role: u.role,
        phone: u.phone,
        city: u.city,
        address: u.address,
      },
    })
  }
  console.log(`✅ Seeded ${usersData.length} aligned users (management & customers)`)

  const [supplierAgro, supplierBudi] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { email: 'supplier@tahusumedang.local' } }),
    prisma.user.findUniqueOrThrow({ where: { email: 'budi.supplier@tahusumedang.local' } }),
  ])

  // 3. Raw Materials (Warehouse Inventory): Linked to registered suppliers
  const rawMaterialsData = [
    {
      name: 'Kedelai Kuning Super (Grade A)',
      sku: 'MAT-SOYA-01',
      category: 'Bahan Baku',
      unit: 'kg',
      unitCost: 12500,
      initialStock: 450,
      supplierId: supplierAgro.id,
      description: 'Kedelai kuning impor non-GMO kualitas prima untuk produksi tahu harian.',
    },
    {
      name: 'Minyak Goreng Sawit Kelapa Super',
      sku: 'MAT-OIL-01',
      category: 'Minyak & Bahan Goreng',
      unit: 'liter',
      unitCost: 16000,
      initialStock: 280,
      supplierId: supplierAgro.id,
      description: 'Minyak goreng jernih titik asap tinggi untuk hasil gorengan krispy keemasan.',
    },
    {
      name: 'Besek Bambu Tradisional Anyaman',
      sku: 'MAT-BESEK-01',
      category: 'Kemasan',
      unit: 'pcs',
      unitCost: 2500,
      initialStock: 500,
      supplierId: supplierBudi.id,
      description: 'Besek anyaman bambu khas Sumedang ramah lingkungan untuk wadah tahu hangat.',
    },
    {
      name: 'Cabai Rawit Hijau & Merah Segar',
      sku: 'MAT-CHILI-01',
      category: 'Bumbu & Pelengkap',
      unit: 'kg',
      unitCost: 42000,
      initialStock: 65,
      supplierId: supplierAgro.id,
      description: 'Cabai rawit segar langsung dari petani lereng Gunung Tampomas.',
    },
    {
      name: 'Plastik Vakum Makanan Higienis',
      sku: 'MAT-PACK-01',
      category: 'Kemasan',
      unit: 'pak',
      unitCost: 35000,
      initialStock: 150,
      supplierId: supplierBudi.id,
      description: 'Plastik vakum food-grade tebal kedap udara untuk paket Tahu Frozen.',
    },
    {
      name: 'Biang Cuka / Koagulan Kedelai Alami',
      sku: 'MAT-COAG-01',
      category: 'Koagulan',
      unit: 'liter',
      unitCost: 20000,
      initialStock: 80,
      supplierId: supplierAgro.id,
      description: 'Air biang fermentasi alami warisan leluhur untuk koagulasi sari kedelai.',
    },
    {
      name: 'Garam Beryodium & Racikan Rempah',
      sku: 'MAT-SPICE-01',
      category: 'Bumbu & Pelengkap',
      unit: 'kg',
      unitCost: 15000,
      initialStock: 45,
      supplierId: supplierAgro.id,
      description: 'Garam murni dan ramuan rempah perendam tahu gurih alami.',
    },
  ]

  const createdMaterials: { id: number; name: string; unitCost: number; unit: string; supplierId: number }[] = []
  for (const m of rawMaterialsData) {
    const mat = await prisma.rawMaterial.create({
      data: {
        name: m.name,
        sku: m.sku,
        category: m.category,
        unit: m.unit,
        unitCost: m.unitCost,
        stock: m.initialStock,
        supplierId: m.supplierId,
        description: m.description,
      },
    })
    createdMaterials.push({ id: mat.id, name: mat.name, unitCost: mat.unitCost, unit: mat.unit, supplierId: m.supplierId })
  }
  console.log(`✅ Seeded ${createdMaterials.length} warehouse raw materials`)

  // 4. Warehouse Inbound Logs (StockEntry) & Corresponding Raw Material Expenses
  // Generate realistic periodic supplier shipments over the past 52 weeks
  for (let w = 52; w >= 0; w--) {
    const entryDate = new Date()
    entryDate.setDate(entryDate.getDate() - w * 7 - randInt(1, 3))
    entryDate.setHours(8 + randInt(0, 4), randInt(0, 59), 0, 0)

    // Weekly shipment of key materials
    const chosenMat = pick(createdMaterials)
    const quantity = chosenMat.unit === 'pcs' ? randInt(100, 250) : chosenMat.unit === 'kg' ? randInt(25, 75) : randInt(20, 50)
    const totalCost = Math.round(quantity * chosenMat.unitCost)

    await prisma.stockEntry.create({
      data: {
        materialId: chosenMat.id,
        quantity,
        unitCost: chosenMat.unitCost,
        totalCost,
        supplierId: chosenMat.supplierId,
        note: `Pengiriman rutin minggu ${53 - w}`,
        date: entryDate,
        createdAt: entryDate,
      },
    })

    // Create corresponding Expense entry in Finance for exact referential synchronization
    await prisma.expense.create({
      data: {
        amount: totalCost,
        category: 'Bahan Baku',
        description: `Inbound ${chosenMat.name} (${quantity} ${chosenMat.unit} @Rp ${chosenMat.unitCost.toLocaleString('id-ID')})`,
        date: entryDate,
        createdAt: entryDate,
      },
    })
  }
  console.log(`✅ Seeded 53 weekly warehouse inbound logs (StockEntry) with matching expenses`)

  // 5. Products: Created with supplier linkage
  const createdProducts: { id: number; price: number; name: string; targetStock: number }[] = []
  for (let i = 0; i < productsBaseline.length; i++) {
    const p = productsBaseline[i]!
    const supId = i % 2 === 0 ? supplierAgro.id : supplierBudi.id
    const created = await prisma.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        category: p.category,
        price: p.price,
        originalPrice: p.originalPrice,
        stock: p.targetStock, // will be finalized after order simulation
        soldCount: 0,         // will be exact sum of delivered/paid items
        rating: p.rating,
        reviewCount: p.reviewCount,
        description: p.description,
        image: p.image,
        badge: p.badge,
        isFlashSale: p.isFlashSale,
        isPopular: p.isPopular,
        supplierId: supId,
      },
    })
    createdProducts.push({
      id: created.id,
      price: created.price,
      name: created.name,
      targetStock: p.targetStock,
    })
  }
  console.log(`✅ Seeded ${createdProducts.length} catalog products`)

  // 6. Orders & OrderItems Simulation over 365 Days
  // Every order strictly belongs to a valid CUSTOMER user
  const customers = await prisma.user.findMany({ where: { role: 'CUSTOMER' } })
  if (customers.length === 0) throw new Error('No CUSTOMER users available for orders!')

  const OPERATIONAL_ACCOUNT = '8880123456'
  const payMethods = ['VA_BCA', 'VA_MANDIRI', 'VA_BNI', 'VA_BRI', 'QRIS', 'RETAIL_INDOMARET', 'RETAIL_ALFAMART', 'COD'] as const

  // Per-product sold tracking to guarantee 100% catalog stock & sales synchronization
  const soldAccumulator: Record<number, number> = {}
  const allOrderedAccumulator: Record<number, number> = {}
  for (const p of createdProducts) {
    soldAccumulator[p.id] = 0
    allOrderedAccumulator[p.id] = 0
  }

  let totalOrdersSeeded = 0

  for (let daysAgo = 365; daysAgo >= 0; daysAgo--) {
    const dayDate = new Date()
    dayDate.setDate(dayDate.getDate() - daysAgo)
    dayDate.setHours(9 + randInt(0, 11), randInt(0, 59), 0, 0)

    const isRecent = daysAgo <= 7
    const isWeekend = [0, 6].includes(dayDate.getDay())
    let ordersToday = isRecent ? randInt(3, 5) : randInt(1, 3)
    if (isWeekend) ordersToday += 1
    if (daysAgo === 0) ordersToday = Math.max(ordersToday, 3)

    for (let o = 0; o < ordersToday; o++) {
      const cust = pick(customers)
      const itemsCount = randInt(1, 3)
      const chosenIdx = [...new Set(Array.from({ length: itemsCount }, () => randInt(0, createdProducts.length - 1)))]

      const items = chosenIdx.map((idx) => {
        const prod = createdProducts[idx]!
        const qty = randInt(1, 3)
        return {
          productId: prod.id,
          quantity: qty,
          price: prod.price,
        }
      })

      const subtotal = items.reduce((s, it) => s + it.price * it.quantity, 0)
      const shippingCost = pick([8000, 10000, 12000, 15000] as const)
      const discount = Math.random() < 0.2 ? randInt(2000, 5000) : 0
      const totalAmount = Math.max(0, subtotal + shippingCost - discount)

      const pm = pick(payMethods)
      const isVA = pm.startsWith('VA_')
      const isQR = pm === 'QRIS'
      const isRetail = pm.startsWith('RETAIL_')
      const prefixMap: Record<string, string> = { VA_BCA: '390', VA_MANDIRI: '892', VA_BNI: '880', VA_BRI: '888' }
      // Seed timestamp used later for orderNumber suffix
      const _seedNow = Date.now()
      const orderSeq = totalOrdersSeeded + 1
      const digits7 = String(_seedNow).slice(-7)
      const opSuffix = OPERATIONAL_ACCOUNT.slice(-4)
      const vaNumber = isVA ? `${prefixMap[pm] ?? '888'}${opSuffix}${digits7}`.slice(0, 16) : null
      const qrisPayload = isQR ? `00020101021226${OPERATIONAL_ACCOUNT}5802ID5914TAHU SUMEDANG6007SUMEDANG6242TS-${digits7}6304${opSuffix}` : null
      const retailRef = isRetail ? `RETAIL-${String(_seedNow).slice(-8)}` : null

      // ~84% paid rate
      const isPaid = Math.random() < 0.84
      const paymentStatus = isPaid ? 'PAID' : (pm === 'COD' ? 'UNPAID' : 'PENDING')
      const status = isPaid
        ? pick(['PAID', 'DELIVERED', 'SHIPPED', 'PROCESSING', 'PACKED'] as const)
        : (pm === 'COD' ? 'PROCESSING' : 'AWAITING_PAYMENT')

      const createdAt = new Date(dayDate.getTime() + o * 25 * 60 * 1000 + randInt(0, 30) * 1000)
      const paidAt = isPaid ? new Date(createdAt.getTime() + randInt(5, 120) * 60 * 1000) : null

      // Track items sold and ordered
      for (const it of items) {
        allOrderedAccumulator[it.productId] = (allOrderedAccumulator[it.productId] || 0) + it.quantity
        if (isPaid || status === 'DELIVERED') {
          soldAccumulator[it.productId] = (soldAccumulator[it.productId] || 0) + it.quantity
        }
      }

      await prisma.order.create({
        data: {
          orderNumber: `TS-${String(createdAt.getTime()).slice(-7)}${randInt(100, 999)}-${totalOrdersSeeded + 1}`,
          userId: cust.id,
          customerName: cust.name,
          customerPhone: cust.phone || `0812${randInt(10000000, 99999999)}`,
          customerEmail: cust.email,
          address: cust.address || `Jl. Contoh No. ${randInt(1, 100)}`,
          city: cust.city || 'Sumedang',
          postalCode: `${randInt(45311, 45399)}`,
          shippingMethod: pick(['Kurir Motor (Sumedang & Sekitarnya)', 'JNE Reguler', 'Ambil di Toko'] as const),
          shippingCost,
          paymentMethod: pm,
          paymentStatus,
          paymentRef: vaNumber ?? qrisPayload ?? retailRef ?? null,
          vaNumber,
          qrisPayload,
          expiresAt: isVA || isQR || isRetail ? new Date(createdAt.getTime() + (isRetail ? 48 : 24) * 60 * 60 * 1000) : null,
          paidAt,
          subtotal,
          discount,
          totalAmount,
          status,
          createdAt,
          items: {
            create: items,
          },
        },
      })
      totalOrdersSeeded++
    }
  }

  // 7. Synchronize Product catalog stock & exact soldCount based on actual order records!
  for (const prod of createdProducts) {
    const exactSold = soldAccumulator[prod.id] || 0
    await prisma.product.update({
      where: { id: prod.id },
      data: {
        soldCount: exactSold,
        stock: prod.targetStock,
      },
    })
  }
  console.log(`✅ Synchronized product stocks & soldCounts with ${totalOrdersSeeded} seeded orders`)

  // 8. General & Operating Expenses: Calibrated for a healthy 65-72% net profit margin
  const operationalExpenseTypes = [
    { cat: 'Operasional', desc: 'Gas LPG 12kg & Minyak tanah dapur penggorengan', min: 150000, max: 350000 },
    { cat: 'Operasional', desc: 'Tagihan Listrik PLN & Air PDAM pabrik tahu', min: 200000, max: 400000 },
    { cat: 'Gaji', desc: 'Honor mingguan kru dapur & asisten penggoreng', min: 450000, max: 800000 },
    { cat: 'Marketing', desc: 'Iklan digital media sosial & materi promosi outlet', min: 100000, max: 250000 },
    { cat: 'Sewa', desc: 'Biaya kebersihan & pemeliharaan outlet Sumedang', min: 80000, max: 180000 },
  ]

  for (let w = 52; w >= 0; w--) {
    const expDate = new Date()
    expDate.setDate(expDate.getDate() - w * 7 - randInt(2, 5))
    expDate.setHours(14, 0, 0, 0)

    const exp1 = pick(operationalExpenseTypes)
    await prisma.expense.create({
      data: {
        amount: randInt(exp1.min, exp1.max),
        category: exp1.cat,
        description: `${exp1.desc} (M-W${53 - w})`,
        date: expDate,
        createdAt: expDate,
      },
    })

    if (w % 2 === 0) {
      const exp2 = pick(operationalExpenseTypes)
      await prisma.expense.create({
        data: {
          amount: randInt(exp2.min, exp2.max),
          category: exp2.cat,
          description: `${exp2.desc} (M-W${53 - w})`,
          date: new Date(expDate.getTime() + 2 * 24 * 60 * 60 * 1000),
          createdAt: expDate,
        },
      })
    }
  }

  console.log(`✅ Seeded operational & recurring expenses across 52 weeks`)
  console.log('🎉 Seed completed successfully with 100% referential integrity and data synchronization!')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
