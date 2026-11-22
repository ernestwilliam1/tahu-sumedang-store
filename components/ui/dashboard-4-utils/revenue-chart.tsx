"use client";

import { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { formatRupiah, cn } from "@/lib/utils";

export interface RevenueChartProps {
  orders?: {
    totalAmount: number;
    paymentStatus: string;
    status: string;
    createdAt: Date | string;
  }[];
}

export type ViewMode = "7d" | "14d" | "30d" | "active-days" | "single-day";

const DAY_NAMES_SHORT = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const DAY_NAMES_FULL = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const MONTH_NAMES_SHORT = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];
const MONTH_NAMES_FULL = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

function formatDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: { fullName?: string; count?: number; label?: string } }>;
  label?: string;
}

function RevenueTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0];
  const item = data?.payload;
  const rev = Number(data?.value) || 0;
  const count = item?.count ?? 0;
  const title = item?.fullName || item?.label || "";

  return (
    <div className="bg-white border border-[#E5E2DC] rounded-xl p-3 shadow-lg text-left text-xs min-w-[170px]">
      <p className="font-bold text-[#1C1917] mb-1.5 border-b border-[#F0EDE8] pb-1">
        {title}
      </p>
      <div className="space-y-1 font-mono">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[#78716C] font-sans">Pendapatan:</span>
          <span className="font-extrabold text-[#D97706]">{formatRupiah(rev)}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-[#78716C] font-sans">Transaksi:</span>
          <span className="font-semibold text-[#1C1917]">{count} pesanan</span>
        </div>
        {count > 0 && (
          <div className="flex items-center justify-between gap-3 pt-1 border-t border-[#F0EDE8] text-[11px]">
            <span className="text-[#78716C] font-sans">Rata-rata:</span>
            <span className="text-[#059669] font-medium">{formatRupiah(Math.round(rev / count))}</span>
          </div>
        )}
      </div>
    </div>
  );
}

interface XAxisTickProps {
  x?: number;
  y?: number;
  payload?: { value: string };
}

function CustomXAxisTick({ x = 0, y = 0, payload }: XAxisTickProps) {
  const raw = String(payload?.value || "");
  if (!raw) return null;

  // Jika ada koma, buat layout 2 baris (Hari di atas lebih tebal, Tanggal di bawah)
  if (raw.includes(", ")) {
    const [dayPart, datePart] = raw.split(", ");
    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={0}
          dy={9}
          textAnchor="middle"
          fill="#1C1917"
          fontSize={10}
          fontWeight={700}
        >
          {dayPart}
        </text>
        <text
          x={0}
          y={0}
          dy={21}
          textAnchor="middle"
          fill="#78716C"
          fontSize={9}
          fontWeight={500}
        >
          {datePart}
        </text>
      </g>
    );
  }

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={14}
        textAnchor="middle"
        fill="#78716C"
        fontSize={10}
        fontWeight={500}
      >
        {raw}
      </text>
    </g>
  );
}

export function RevenueChart({ orders }: RevenueChartProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("7d");
  const [selectedDayKey, setSelectedDayKey] = useState<string>("");
  const [now, setNow] = useState(() => new Date());

  // Realtime clock ticker — otomatis ganti hari saat melewati pukul 00:00
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  // Ambil semua hari yang tercatat transaksi lunas di database + sertakan Hari Ini secara realtime
  const availableDays = useMemo(() => {
    const paidOrders = (orders || []).filter((o) => o.paymentStatus === "PAID");
    const map = new Map<string, { key: string; date: Date; total: number; count: number; isToday?: boolean }>();

    // 1. Selalu sertakan hari ini secara realtime
    const todayKey = formatDateKey(now);
    map.set(todayKey, {
      key: todayKey,
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
      total: 0,
      count: 0,
      isToday: true,
    });

    // 2. Petakan riwayat pesanan
    for (const o of paidOrders) {
      const d = new Date(o.createdAt);
      const key = formatDateKey(d);
      const cur = map.get(key);
      if (cur) {
        cur.total += o.totalAmount;
        cur.count += 1;
      } else {
        const dateObj = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        map.set(key, {
          key,
          date: dateObj,
          total: o.totalAmount,
          count: 1,
          isToday: key === todayKey,
        });
      }
    }

    return Array.from(map.values()).sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [orders, now]);

  // Tentukan hari aktif yang sedang dipilih (default: Hari Ini secara realtime)
  const todayKey = formatDateKey(now);
  const activeDayKey = selectedDayKey || todayKey;

  // Hitung data grafik berdasarkan mode yang dipilih
  const chartData = useMemo(() => {
    if (!orders || orders.length === 0) {
      return [
        { name: "Senin", fullName: "Senin", revenue: 1200000, count: 5 },
        { name: "Selasa", fullName: "Selasa", revenue: 1800000, count: 7 },
        { name: "Rabu", fullName: "Rabu", revenue: 1500000, count: 6 },
        { name: "Kamis", fullName: "Kamis", revenue: 2200000, count: 9 },
        { name: "Jumat", fullName: "Jumat", revenue: 3100000, count: 12 },
        { name: "Sabtu", fullName: "Sabtu", revenue: 4500000, count: 18 },
        { name: "Minggu", fullName: "Minggu", revenue: 3800000, count: 15 },
      ];
    }

    const paidOrders = orders.filter((o) => o.paymentStatus === "PAID");

    // 1. MODE: Single Day (Detail per jam pada hari yang dipilih)
    if (viewMode === "single-day") {
      const targetDay = availableDays.find((d) => d.key === activeDayKey) || availableDays[0];
      if (!targetDay) return [];

      const targetOrders = paidOrders.filter((o) => {
        const d = new Date(o.createdAt);
        return formatDateKey(d) === targetDay.key;
      });

      // Buat slot jam dari 06:00 sampai 22:00 (interval 2 jam)
      const slots = [6, 8, 10, 12, 14, 16, 18, 20, 22];
      return slots.map((hour) => {
        const nextHour = hour + 2;
        const matching = targetOrders.filter((o) => {
          const h = new Date(o.createdAt).getHours();
          return h >= hour && h < nextHour;
        });

        const rev = matching.reduce((sum, o) => sum + o.totalAmount, 0);
        const name = `${String(hour).padStart(2, "0")}:00`;
        const fullName = `Pukul ${name} – ${String(nextHour).padStart(2, "0")}:00`;

        return {
          name,
          fullName,
          revenue: rev,
          count: matching.length,
        };
      });
    }

    // 2. MODE: Active Days (8 hari bertransaksi terbaru di database agar lega & tidak tumpang tindih)
    if (viewMode === "active-days") {
      const transacting = availableDays.filter((d) => d.total > 0 || d.isToday);
      const slice = transacting.slice(0, 8).reverse();
      return slice.map((day) => {
        const dow = DAY_NAMES_SHORT[day.date.getDay()] || "";
        const dom = day.date.getDate();
        const mon = MONTH_NAMES_SHORT[day.date.getMonth()] || "";
        const fullDow = DAY_NAMES_FULL[day.date.getDay()] || "";
        const fullMon = MONTH_NAMES_FULL[day.date.getMonth()] || "";
        const isToday = day.key === todayKey;

        return {
          name: `${dow}, ${dom} ${mon}`,
          fullName: `${fullDow}, ${dom} ${fullMon} ${day.date.getFullYear()}${isToday ? " (Hari Ini)" : ""}`,
          revenue: day.total,
          count: day.count,
          isToday,
        };
      });
    }

    // 3. MODE: 7 Hari / 14 Hari / 30 Hari (Kronologis berurutan real-time mengikuti hari ini)
    const numDays = viewMode === "7d" ? 7 : viewMode === "14d" ? 14 : 30;

    // Selalu gunakan hari ini (realtime) sebagai anchor tanggal terakhir
    const anchorDate = new Date(now);
    anchorDate.setHours(0, 0, 0, 0);

    const buckets = [];
    for (let i = numDays - 1; i >= 0; i--) {
      const curDate = new Date(anchorDate);
      curDate.setDate(anchorDate.getDate() - i);
      const nextDate = new Date(curDate);
      nextDate.setDate(curDate.getDate() + 1);

      const matchingOrders = paidOrders.filter((o) => {
        const t = new Date(o.createdAt).getTime();
        return t >= curDate.getTime() && t < nextDate.getTime();
      });

      const dayRevenue = matchingOrders.reduce((sum, o) => sum + o.totalAmount, 0);
      const dow = DAY_NAMES_SHORT[curDate.getDay()] || "";
      const dom = curDate.getDate();
      const mon = MONTH_NAMES_SHORT[curDate.getMonth()] || "";
      const fullDow = DAY_NAMES_FULL[curDate.getDay()] || "";
      const fullMon = MONTH_NAMES_FULL[curDate.getMonth()] || "";
      const isToday = formatDateKey(curDate) === todayKey;

      // Format sumbu X: jika 7 hari sertakan nama hari & bulan, jika >7 hari cukup tanggal
      const name = viewMode === "7d" ? `${dow}, ${dom} ${mon}` : `${dom}/${curDate.getMonth() + 1}`;

      buckets.push({
        name,
        fullName: `${fullDow}, ${dom} ${fullMon} ${curDate.getFullYear()}${isToday ? " (Hari Ini)" : ""}`,
        revenue: dayRevenue,
        count: matchingOrders.length,
        isToday,
      });
    }

    return buckets;
  }, [orders, availableDays, viewMode, activeDayKey, now, todayKey]);

  // Total dan rata-rata
  const totalRevenue = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.revenue, 0);
  }, [chartData]);

  const totalOrdersInChart = useMemo(() => {
    return chartData.reduce((sum, item) => sum + (item.count || 0), 0);
  }, [chartData]);

  // Dapatkan info hari yang sedang dipilih (untuk mode single-day)
  const currentDayInfo = useMemo(() => {
    return availableDays.find((d) => d.key === activeDayKey) || availableDays[0];
  }, [availableDays, activeDayKey]);

  // Navigasi hari sebelumnya / berikutnya untuk mode single-day
  const handleStepDay = (step: number) => {
    const idx = availableDays.findIndex((d) => d.key === activeDayKey);
    if (idx === -1) return;
    const nextIdx = idx - step; // availableDays is sorted descending
    if (nextIdx >= 0 && nextIdx < availableDays.length) {
      setSelectedDayKey(availableDays[nextIdx].key);
    }
  };

  const currentDayIdx = availableDays.findIndex((d) => d.key === activeDayKey);
  const canGoPrev = currentDayIdx < availableDays.length - 1;
  const canGoNext = currentDayIdx > 0;

  return (
    <Card className="col-span-1 md:col-span-2 bg-white border-[#E5E2DC] shadow-sm flex flex-col justify-between">
      <CardHeader className="pb-3 space-y-3">
        {/* Baris Judul & Total */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-lg font-bold text-[#1C1917] tracking-tight">
              {viewMode === "single-day" && currentDayInfo
                ? `Grafik Pendapatan: ${DAY_NAMES_FULL[currentDayInfo.date.getDay()]}, ${currentDayInfo.date.getDate()} ${MONTH_NAMES_FULL[currentDayInfo.date.getMonth()]}`
                : viewMode === "active-days"
                ? "Grafik Hari-Hari Bertransaksi"
                : `Grafik Pendapatan ${viewMode === "7d" ? "7 Hari" : viewMode === "14d" ? "14 Hari" : "30 Hari"}`}
            </CardTitle>
            <p className="text-xs text-[#78716C] mt-0.5">
              {viewMode === "single-day"
                ? "Rincian pendapatan per rentang jam operasional toko"
                : viewMode === "active-days"
                ? "Menampilkan 8 hari bertransaksi terbaru yang tercatat di kasir"
                : `Tren transaksi periode ${viewMode === "7d" ? "7" : viewMode === "14d" ? "14" : "30"} hari terakhir`}
            </p>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center p-2.5 sm:p-0 bg-[#FAF9F6] sm:bg-transparent rounded-xl border border-[#E5E2DC] sm:border-none">
            <span className="text-[11px] font-semibold text-[#78716C] block leading-none">
              {viewMode === "single-day" ? "Total Hari Ini" : "Total Periode"}
            </span>
            <div className="text-right">
              <span className="text-base sm:text-lg font-extrabold text-[#059669] leading-tight block font-mono">
                {formatRupiah(totalRevenue)}
              </span>
              <span className="text-[10px] text-[#78716C]">
                {totalOrdersInChart} transaksi lunas
              </span>
            </div>
          </div>
        </div>

        {/* Baris Tombol Filter Periode */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#F0EDE8]">
          <div className="flex items-center gap-1.5 flex-wrap">
            {(
              [
                { id: "7d", label: "7 Hari" },
                { id: "14d", label: "14 Hari" },
                { id: "30d", label: "30 Hari" },
                { id: "active-days", label: "Hari Transaksi" },
                { id: "single-day", label: "Pilih Hari Tertentu" },
              ] as const
            ).map((tab) => {
              const isSelected = viewMode === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setViewMode(tab.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 active:scale-95 cursor-pointer",
                    isSelected
                      ? "bg-[#D97706] text-white shadow-xs"
                      : "bg-[#FAF9F6] hover:bg-[#F3F1ED] text-[#57534E] border border-[#E5E2DC]"
                  )}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Pemilih Hari jika dalam mode single-day */}
          {viewMode === "single-day" && availableDays.length > 0 && (
            <div className="flex items-center gap-1.5 w-full sm:w-auto mt-1 sm:mt-0">
              <button
                onClick={() => handleStepDay(-1)}
                disabled={!canGoPrev}
                title="Hari sebelumnya"
                aria-label="Hari sebelumnya"
                className="w-7 h-7 rounded-lg border border-[#E5E2DC] bg-[#FAF9F6] hover:bg-white text-xs font-bold text-[#1C1917] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition"
              >
                ‹
              </button>
              <select
                value={activeDayKey}
                onChange={(e) => setSelectedDayKey(e.target.value)}
                className="h-7 px-2.5 text-xs font-semibold bg-[#FAF9F6] border border-[#E5E2DC] rounded-lg text-[#1C1917] focus:bg-white focus:outline-none focus:border-[#D97706] cursor-pointer max-w-[210px] truncate"
              >
                {availableDays.map((d) => (
                  <option key={d.key} value={d.key}>
                    {d.isToday ? "Hari Ini • " : ""}{DAY_NAMES_SHORT[d.date.getDay()]}, {d.date.getDate()} {MONTH_NAMES_SHORT[d.date.getMonth()]} (
                    {formatRupiah(d.total)})
                  </option>
                ))}
              </select>
              <button
                onClick={() => handleStepDay(1)}
                disabled={!canGoNext}
                title="Hari berikutnya"
                aria-label="Hari berikutnya"
                className="w-7 h-7 rounded-lg border border-[#E5E2DC] bg-[#FAF9F6] hover:bg-white text-xs font-bold text-[#1C1917] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition"
              >
                ›
              </button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="h-[295px] pt-1 pb-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 12, left: -8, bottom: 22 }}>
            <defs>
              <linearGradient id="colorRevenueWeekly" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#D97706" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#D97706" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={{ stroke: "#E5E2DC" }}
              tick={<CustomXAxisTick />}
              interval={viewMode === "30d" ? 3 : viewMode === "14d" ? 1 : 0}
            />
            <YAxis
              stroke="#78716C"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) =>
                v >= 1000000 ? `${(v / 1000000).toFixed(1)}jt` : v >= 1000 ? `${Math.round(v / 1000)}rb` : `${v}`
              }
            />
            <Tooltip content={<RevenueTooltip />} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#D97706"
              fill="url(#colorRevenueWeekly)"
              strokeWidth={2.5}
              activeDot={{ r: 5, fill: "#D97706", stroke: "#FFFFFF", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
