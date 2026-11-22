import { CategoryRankChart } from "@/components/ui/dashboard-4-utils/category-rank-chart";
import { QuickActions } from "@/components/ui/dashboard-4-utils/quick-actions";
import { RefundReturnRateChart } from "@/components/ui/dashboard-4-utils/refund-return-rate-chart";
import { RevenueChart } from "@/components/ui/dashboard-4-utils/revenue-chart";
import { DashboardStats } from "@/components/ui/dashboard-4-utils/stats";

export interface DashboardProps {
  orders?: any[];
  expenses?: any[];
  products?: any[];
  customerCount?: number;
  hideQuickActions?: boolean;
}

export function Dashboard({
  orders,
  expenses,
  products,
  customerCount,
  hideQuickActions,
}: DashboardProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <DashboardStats orders={orders} expenses={expenses} customerCount={customerCount} />
      <RevenueChart orders={orders} />
      <RefundReturnRateChart orders={orders} />
      <CategoryRankChart products={products} orders={orders} />
      {!hideQuickActions && <QuickActions />}
    </div>
  );
}
export default Dashboard;
