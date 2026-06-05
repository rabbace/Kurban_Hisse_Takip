import { createServerSupabaseClient } from "@/lib/supabase-server";
import { formatCurrency } from "@/lib/utils";
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/types";
import Link from "next/link";
import { Package, CheckCircle2, Clock, Truck } from "lucide-react";

export default async function AdminDashboardPage() {
  const supabase = await createServerSupabaseClient();

  const [
    { count: totalOrders },
    { count: beklemede },
    { count: kesildi },
    { count: teslim },
    { data: recentOrders },
    { data: todayAppointments },
  ] = await Promise.all([
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "beklemede"),
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "kesildi"),
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "teslim_edildi"),
    supabase
      .from("orders")
      .select("*, customers(full_name, phone), animals(name, type)")
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("orders")
      .select("*, customers(full_name, phone), animals(name)")
      .not("appointment_datetime", "is", null)
      .gte("appointment_datetime", new Date().toISOString().split("T")[0])
      .lte(
        "appointment_datetime",
        new Date().toISOString().split("T")[0] + "T23:59:59"
      )
      .order("appointment_datetime"),
  ]);

  const stats = [
    {
      label: "Toplam Sipariş",
      value: totalOrders ?? 0,
      icon: Package,
      color: "bg-blue-50 text-blue-700",
    },
    {
      label: "Beklemede",
      value: beklemede ?? 0,
      icon: Clock,
      color: "bg-yellow-50 text-yellow-700",
    },
    {
      label: "Kesildi",
      value: kesildi ?? 0,
      icon: CheckCircle2,
      color: "bg-purple-50 text-purple-700",
    },
    {
      label: "Teslim Edildi",
      value: teslim ?? 0,
      icon: Truck,
      color: "bg-green-50 text-green-700",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">Genel durum özeti</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card">
            <div className={`inline-flex rounded-xl p-2.5 ${color}`}>
              <Icon size={20} />
            </div>
            <p className="mt-3 text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Today's Appointments */}
        <div className="card">
          <h2 className="mb-4 text-sm font-semibold text-gray-700">
            Bugünkü Randevular ({todayAppointments?.length ?? 0})
          </h2>
          {!todayAppointments?.length ? (
            <p className="text-sm text-gray-400 py-4 text-center">
              Bugün randevu bulunmuyor
            </p>
          ) : (
            <div className="space-y-2">
              {todayAppointments.map((o: Record<string, unknown>) => (
                <Link
                  key={o.id as string}
                  href={`/admin/siparisler?id=${o.id}`}
                  className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2.5 hover:bg-gray-100 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {(o.customers as { full_name: string } | null)?.full_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(o.animals as { name: string } | null)?.name} &bull;{" "}
                      {new Date(o.appointment_datetime as string).toLocaleTimeString("tr-TR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <span className={`badge ${STATUS_COLORS[o.status as keyof typeof STATUS_COLORS]}`}>
                    {STATUS_LABELS[o.status as keyof typeof STATUS_LABELS]}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700">Son Siparişler</h2>
            <Link href="/admin/siparisler" className="text-xs text-emerald-600 hover:underline">
              Tümünü Gör →
            </Link>
          </div>
          <div className="space-y-2">
            {recentOrders?.slice(0, 6).map((o: Record<string, unknown>) => (
              <div
                key={o.id as string}
                className="flex items-center justify-between text-sm"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {(o.customers as { full_name: string } | null)?.full_name}
                  </p>
                  <p className="text-xs text-gray-400">{o.tracking_code as string}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-emerald-700">
                    {formatCurrency(o.total_price as number)}
                  </p>
                  <span
                    className={`badge text-xs ${
                      STATUS_COLORS[o.status as keyof typeof STATUS_COLORS]
                    }`}
                  >
                    {STATUS_LABELS[o.status as keyof typeof STATUS_LABELS]}
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
