"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { MOCK_ORDERS } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import { STATUS_LABELS, STATUS_COLORS, OrderStatus } from "@/lib/types";
import Link from "next/link";
import { Package, CheckCircle2, Clock, Truck, Wallet } from "lucide-react";

const DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

type DashboardData = {
  totalOrders: number;
  totalRevenue: number;
  outstandingPayments: number;
  beklemede: number;
  kesildi: number;
  teslim: number;
  recentOrders: Record<string, unknown>[];
  todayAppointments: Record<string, unknown>[];
};

function getDemoData(): DashboardData {
  const today = new Date().toISOString().split("T")[0];
  const activeOrders = MOCK_ORDERS.filter((o) => o.status !== "iptal");
  return {
    totalOrders: MOCK_ORDERS.length,
    totalRevenue: activeOrders.reduce((sum, o) => sum + o.total_price, 0),
    outstandingPayments: activeOrders.reduce(
      (sum, o) => sum + (o.total_price - (o.paid_amount ?? 0)),
      0
    ),
    beklemede: MOCK_ORDERS.filter((o) => o.status === "beklemede").length,
    kesildi: MOCK_ORDERS.filter((o) => o.status === "kesildi").length,
    teslim: MOCK_ORDERS.filter((o) => o.status === "teslim_edildi").length,
    recentOrders: MOCK_ORDERS as unknown as Record<string, unknown>[],
    todayAppointments: MOCK_ORDERS.filter(
      (o) => o.appointment_datetime?.startsWith(today)
    ) as unknown as Record<string, unknown>[],
  };
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(DEMO ? getDemoData() : null);

  useEffect(() => {
    if (DEMO) return;
    async function load() {
      const supabase = createClient();
      const [
        { count: total },
        { data: revenueRows },
        { count: bek },
        { count: kes },
        { count: tes },
        { data: recent },
        { data: todayAppt },
      ] = await Promise.all([
        supabase.from("orders").select("*", { count: "exact", head: true }),
        supabase.from("orders").select("total_price, paid_amount").neq("status", "iptal"),
        supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "beklemede"),
        supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "kesildi"),
        supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "teslim_edildi"),
        supabase.from("orders").select("*, customers(full_name,phone), animals(name,type)").order("created_at", { ascending: false }).limit(6),
        supabase.from("orders").select("*, customers(full_name,phone), animals(name)").not("appointment_datetime", "is", null).gte("appointment_datetime", new Date().toISOString().split("T")[0]).lte("appointment_datetime", new Date().toISOString().split("T")[0] + "T23:59:59").order("appointment_datetime"),
      ]);
      setData({
        totalOrders: total ?? 0,
        totalRevenue: (revenueRows ?? []).reduce((sum, r) => sum + (r.total_price ?? 0), 0),
        outstandingPayments: (revenueRows ?? []).reduce(
          (sum, r) => sum + ((r.total_price ?? 0) - (r.paid_amount ?? 0)),
          0
        ),
        beklemede: bek ?? 0,
        kesildi: kes ?? 0,
        teslim: tes ?? 0,
        recentOrders: (recent ?? []) as Record<string, unknown>[],
        todayAppointments: (todayAppt ?? []) as Record<string, unknown>[],
      });
    }
    load();
  }, []);

  if (!data) {
    return <div className="flex justify-center items-center h-full p-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" /></div>;
  }

  const stats = [
    { label: "Toplam Ciro", value: formatCurrency(data.totalRevenue), icon: Wallet, color: "bg-red-50 text-red-700" },
    { label: "Bekleyen Ödeme", value: formatCurrency(data.outstandingPayments), icon: Wallet, color: "bg-amber-50 text-amber-700" },
    { label: "Toplam Sipariş", value: data.totalOrders, icon: Package, color: "bg-blue-50 text-blue-700" },
    { label: "Beklemede", value: data.beklemede, icon: Clock, color: "bg-yellow-50 text-yellow-700" },
    { label: "Kesildi", value: data.kesildi, icon: CheckCircle2, color: "bg-purple-50 text-purple-700" },
    { label: "Teslim Edildi", value: data.teslim, icon: Truck, color: "bg-green-50 text-green-700" },
  ];

  return (
    <div className="p-6 space-y-6">
      {DEMO && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
          🔍 Demo modu — veriler gerçek değildir
        </div>
      )}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">Genel durum özeti</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card">
            <div className={`inline-flex rounded-xl p-2.5 ${color}`}><Icon size={20} /></div>
            <p className="mt-3 text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="mb-4 text-sm font-semibold text-gray-700">
            Bugünkü Randevular ({data.todayAppointments.length})
          </h2>
          {!data.todayAppointments.length ? (
            <p className="text-sm text-gray-400 py-4 text-center">Bugün randevu yok</p>
          ) : (
            <div className="space-y-2">
              {data.todayAppointments.map((o) => (
                <div key={o.id as string} className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2.5">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {(o.customers as { full_name: string } | null)?.full_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(o.animals as { name: string } | null)?.name} · {new Date(o.appointment_datetime as string).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <span className={`badge ${STATUS_COLORS[o.status as OrderStatus]}`}>
                    {STATUS_LABELS[o.status as OrderStatus]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700">Son Siparişler</h2>
            <Link href="/admin/siparisler" className="text-xs text-red-600 hover:underline">Tümünü Gör →</Link>
          </div>
          <div className="space-y-3">
            {data.recentOrders.map((o) => (
              <div key={o.id as string} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium text-gray-900">
                    {(o.customers as { full_name: string } | null)?.full_name}
                  </p>
                  <p className="text-xs text-gray-400">{o.tracking_code as string}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-red-700">{formatCurrency(o.total_price as number)}</p>
                  <span className={`badge text-xs ${STATUS_COLORS[o.status as OrderStatus]}`}>
                    {STATUS_LABELS[o.status as OrderStatus]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
