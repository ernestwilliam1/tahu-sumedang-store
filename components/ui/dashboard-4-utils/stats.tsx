import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingBag, Users, TrendingUp } from "lucide-react";
import { formatRupiah } from "@/lib/utils";

export interface DashboardStatsProps {
  orders?: {
    totalAmount: number;
    paymentStatus: string;
    status: string;
    createdAt: Date | string;
    userId?: number | null;
  }[];
  expenses?: {
    amount: number;
    date: Date | string;
  }[];
  customerCount?: number;
}

export function DashboardStats({ orders, expenses, customerCount }: DashboardStatsProps) {
  // If dynamic orders and expenses are provided, calculate exact aggregates
  let totalRevenue = 14580000;
  let totalOrdersCount = 289;
  let activeCustomers = customerCount ?? 1240;
  let profitMargin = "34.2%";
  let momText = "+12% dari bulan lalu";
  let weeklyOrderText = "+8% minggu ini";
  let newCustomerText = "+24 baru hari ini";

  if (orders && orders.length > 0) {
    // Ledger truth: only paymentStatus PAID counts as revenue (not status alias)
    const paidOrders = orders.filter((o) => o.paymentStatus === "PAID");
    totalRevenue = paidOrders.reduce((s, o) => s + o.totalAmount, 0);
    totalOrdersCount = orders.length;

    const totalExpenses = (expenses || []).reduce((s, e) => s + e.amount, 0);
    const netProfit = totalRevenue - totalExpenses;
    if (totalRevenue > 0) {
      profitMargin = `${((netProfit / totalRevenue) * 100).toFixed(1)}%`;
    }

    // Dynamic month-over-month calculation (last 30d vs 31-60d)
    const now = Date.now();
    const d30 = 30 * 24 * 60 * 60 * 1000;
    const revLast30 = paidOrders
      .filter((o) => now - new Date(o.createdAt).getTime() <= d30)
      .reduce((s, o) => s + o.totalAmount, 0);
    const revPrev30 = paidOrders
      .filter((o) => {
        const diff = now - new Date(o.createdAt).getTime();
        return diff > d30 && diff <= 2 * d30;
      })
      .reduce((s, o) => s + o.totalAmount, 0);

    if (revPrev30 > 0) {
      const growth = Math.round(((revLast30 - revPrev30) / revPrev30) * 100);
      momText = `${growth >= 0 ? "+" : ""}${growth}% dari bulan lalu`;
    }

    // Dynamic weekly order growth (last 7d vs 8-14d)
    const d7 = 7 * 24 * 60 * 60 * 1000;
    const ordersLast7 = orders.filter(
      (o) => now - new Date(o.createdAt).getTime() <= d7
    ).length;
    const ordersPrev7 = orders.filter((o) => {
      const diff = now - new Date(o.createdAt).getTime();
      return diff > d7 && diff <= 2 * d7;
    }).length;

    if (ordersPrev7 > 0) {
      const orderGrowth = Math.round(((ordersLast7 - ordersPrev7) / ordersPrev7) * 100);
      weeklyOrderText = `${orderGrowth >= 0 ? "+" : ""}${orderGrowth}% minggu ini`;
    }

    // Active customer base
    const uniqueBuyers = new Set(orders.map((o) => o.userId).filter(Boolean)).size;
    activeCustomers = customerCount ?? (uniqueBuyers > 0 ? uniqueBuyers : 15);
    newCustomerText = `${ordersLast7} pesanan minggu ini`;
  }

  return (
    <>
      <Card className="bg-white border-[#E5E2DC] shadow-sm overflow-hidden min-w-0">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-[#78716C]">Total Pendapatan</CardTitle>
          <DollarSign className="h-4 w-4 text-[#D97706] shrink-0" />
        </CardHeader>
        <CardContent className="min-w-0">
          <div className="text-lg sm:text-xl lg:text-2xl font-bold text-[#1C1917] tracking-tight tabular-nums break-all leading-tight">
            {formatRupiah(totalRevenue)}
          </div>
          <p className="text-xs text-[#059669] mt-1 font-medium break-words">{momText}</p>
        </CardContent>
      </Card>

      <Card className="bg-white border-[#E5E2DC] shadow-sm overflow-hidden min-w-0">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-[#78716C]">Total Pesanan</CardTitle>
          <ShoppingBag className="h-4 w-4 text-[#D97706] shrink-0" />
        </CardHeader>
        <CardContent className="min-w-0">
          <div className="text-lg sm:text-xl lg:text-2xl font-bold text-[#1C1917] tracking-tight tabular-nums break-all leading-tight">
            {totalOrdersCount.toLocaleString("id-ID")} Pesanan
          </div>
          <p className="text-xs text-[#059669] mt-1 font-medium break-words">{weeklyOrderText}</p>
        </CardContent>
      </Card>

      <Card className="bg-white border-[#E5E2DC] shadow-sm overflow-hidden min-w-0">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-[#78716C]">Pelanggan Terdaftar</CardTitle>
          <Users className="h-4 w-4 text-[#D97706] shrink-0" />
        </CardHeader>
        <CardContent className="min-w-0">
          <div className="text-lg sm:text-xl lg:text-2xl font-bold text-[#1C1917] tracking-tight tabular-nums break-all leading-tight">
            {activeCustomers.toLocaleString("id-ID")} Pelanggan
          </div>
          <p className="text-xs text-[#059669] mt-1 font-medium break-words">{newCustomerText}</p>
        </CardContent>
      </Card>

      <Card className="bg-white border-[#E5E2DC] shadow-sm overflow-hidden min-w-0">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-[#78716C]">Margin Keuntungan</CardTitle>
          <TrendingUp className="h-4 w-4 text-[#D97706] shrink-0" />
        </CardHeader>
        <CardContent className="min-w-0">
          <div className="text-lg sm:text-xl lg:text-2xl font-bold text-[#1C1917] tracking-tight break-all leading-tight">
            {profitMargin}
          </div>
          <p className="text-xs text-[#059669] mt-1 font-medium">Optimal & Stabil</p>
        </CardContent>
      </Card>
    </>
  );
}
