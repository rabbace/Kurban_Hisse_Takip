"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import { Order, STATUS_LABELS, STATUS_COLORS, DELIVERY_TYPE_LABELS } from "@/lib/types";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Calendar, Clock, Loader2, RefreshCw } from "lucide-react";

export default function AdminKesimPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const load = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("orders")
      .select("*, customers(*), animals(*)")
      .not("appointment_datetime", "is", null)
      .gte("appointment_datetime", selectedDate + "T00:00:00")
      .lte("appointment_datetime", selectedDate + "T23:59:59")
      .neq("status", "iptal")
      .order("appointment_datetime");
    setOrders((data as Order[]) ?? []);
    setLoading(false);
  }, [selectedDate]);

  useEffect(() => { load(); }, [load]);

  const grouped = orders.reduce<Record<string, Order[]>>((acc, o) => {
    const hour = o.appointment_datetime
      ? new Date(o.appointment_datetime).toLocaleTimeString("tr-TR", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "Saat Belirtilmemiş";
    (acc[hour] ??= []).push(o);
    return acc;
  }, {});

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Kesim Takvimi</h1>
          <p className="text-sm text-gray-500">{orders.length} randevu</p>
        </div>
        <button onClick={load} className="btn-secondary text-xs">
          <RefreshCw size={14} />
          Yenile
        </button>
      </div>

      <div className="flex items-center gap-3">
        <Calendar size={18} className="text-emerald-600" />
        <input
          type="date"
          className="input text-sm py-2"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-emerald-600" size={28} />
        </div>
      ) : orders.length === 0 ? (
        <div className="py-16 text-center text-gray-400">
          <p className="text-4xl">📅</p>
          <p className="mt-3 text-sm font-medium">Bu gün için randevu yok</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([hour, slotOrders]) => (
            <div key={hour} className="card">
              <div className="flex items-center gap-2 mb-3">
                <Clock size={16} className="text-emerald-600" />
                <span className="font-bold text-gray-800">{hour}</span>
                <span className="badge bg-emerald-100 text-emerald-700">
                  {slotOrders.length} sipariş
                </span>
              </div>
              <div className="space-y-2">
                {slotOrders.map((o) => (
                  <div
                    key={o.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-gray-50 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">
                          {o.customers?.full_name}
                        </p>
                        <span className="text-xs text-gray-400">
                          {o.customers?.phone}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-0.5">
                        {o.animals?.name} &bull; {o.share_count} hisse
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {DELIVERY_TYPE_LABELS[o.delivery_type]}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-semibold text-emerald-700 text-sm">
                        {formatCurrency(o.total_price)}
                      </span>
                      <span
                        className={`badge ${
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
          ))}
        </div>
      )}
    </div>
  );
}
