"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function QuickActions() {
  const fire = (name: string) => window.dispatchEvent(new CustomEvent(name));
  return (
    <Card className="col-span-1 md:col-span-2 lg:col-span-4 bg-white border-[#E5E2DC] shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-extrabold tracking-[0.14em] uppercase text-[#1C1917]">Aksi Cepat & Pintasan Keuangan</CardTitle>
        <p className="text-xs text-[#78716C]">Pintasan operasional — unduh laporan periode aktif</p>
      </CardHeader>
      <CardContent>
        <Button onClick={() => fire('finance:export')} className="bg-[#1C1917] text-white hover:bg-[#292524] text-xs font-bold">Unduh Laporan Keuangan (CSV)</Button>
      </CardContent>
    </Card>
  );
}
