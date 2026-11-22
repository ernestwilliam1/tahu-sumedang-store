import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface CategoryRankChartProps {
  products?: {
    id: number;
    name: string;
    category: string;
    soldCount: number;
  }[];
  orders?: {
    items?: {
      quantity: number;
      product?: { name: string; category?: string };
    }[];
  }[];
}

const defaultFallbackCategories = [
  { name: "Paket Besek", sales: "1.420 terjual", percentage: "35%" },
  { name: "Tahu Goreng", sales: "980 terjual", percentage: "25%" },
  { name: "Tahu Mercon", sales: "650 terjual", percentage: "18%" },
  { name: "Pelengkap", sales: "520 terjual", percentage: "12%" },
];

export function CategoryRankChart({ products, orders }: CategoryRankChartProps) {
  const categoryData = useMemo(() => {
    // 1. If products with soldCount are available:
    if (products && products.length > 0) {
      const catMap: Record<string, number> = {};
      let totalSold = 0;

      for (const p of products) {
        const cat = p.category || "Lainnya";
        catMap[cat] = (catMap[cat] || 0) + (p.soldCount || 0);
        totalSold += p.soldCount || 0;
      }

      if (totalSold > 0) {
        return Object.entries(catMap)
          .map(([name, count]) => ({
            name,
            count,
            sales: `${count.toLocaleString("id-ID")} terjual`,
            percentage: `${Math.round((count / totalSold) * 100)}%`,
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 4);
      }
    }

    // 2. If orders with items are available:
    if (orders && orders.length > 0) {
      const catMap: Record<string, number> = {};
      let totalSold = 0;

      for (const o of orders) {
        if (!o.items) continue;
        for (const item of o.items) {
          const cat = item.product?.category || "Tahu Goreng";
          catMap[cat] = (catMap[cat] || 0) + item.quantity;
          totalSold += item.quantity;
        }
      }

      if (totalSold > 0) {
        return Object.entries(catMap)
          .map(([name, count]) => ({
            name,
            count,
            sales: `${count.toLocaleString("id-ID")} terjual`,
            percentage: `${Math.round((count / totalSold) * 100)}%`,
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 4);
      }
    }

    return defaultFallbackCategories;
  }, [products, orders]);

  return (
    <Card className="col-span-1 bg-white border-[#E5E2DC] shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-[#1C1917]">
          Peringkat Kategori Produk
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {categoryData.map((cat, i) => (
          <div
            key={i}
            className="flex items-center justify-between border-b border-[#E5E2DC] pb-2 last:border-0"
          >
            <div>
              <p className="font-medium text-[#1C1917] text-sm">{cat.name}</p>
              <p className="text-xs text-[#78716C]">{cat.sales}</p>
            </div>
            <span className="text-xs font-semibold px-2 py-1 bg-[#FEF3C7] text-[#92400E] rounded-md">
              {cat.percentage}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
