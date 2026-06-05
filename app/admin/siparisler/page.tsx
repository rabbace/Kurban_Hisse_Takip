"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import {
  Order,
  OrderStatus,
  STATUS_LABELS,
  STATUS_COLORS,
  DELIVERY_TYPE_LABELS,
  ANIMAL_TYPE_LABELS,
} from "@/lib/types";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Search, ChevronDown, X, Loader2, RefreshCw } from "lucide-react";

const ALL = "hepsi";

export default function AdminSiparislerPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(ALL);
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState<OrderStatus>("beklemede");
  const [statusNote, setStatusNote] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    let query = supabase
      .from("orders")
      .select("*, customers(*), animals(*)")
      .order("created_at", { ascending: false });

    if (statusFilter !== ALL) {
      query = query.eq("status", statusFilter);
    }

    const { data } = await query;
    setOrders((data as Order[]) ?? []);
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  const filtered = orders.filter((o) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      o.tracking_code.toLowerCase().includes(s) ||
      o.customers?.full_name?.toLowerCase().includes(s) ||
      o.customers?.phone?.includes(s)
    );
  });

  async function handleStatusUpdate() {
    if (!selectedOrder) return;
    setUpdatingStatus(true);
    const supabase = createClient();

    await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", selectedOrder.id);

    await supabase.from("slaughter_logs").insert({
      order_id: selectedOrder.id,
      status: newStatus,
      note: statusNote.trim() || null,
    });

    setSelectedOrder(null);
    setStatusNote("");
    setUpdatingStatus(false);
    load();
  }

  const STATUS_OPTIONS: OrderStatus[] = [
    "beklemede",
    "onaylandi",
    "kesim_basladi",
    "kesildi",
    "teslim_edildi",
    "iptal",
  ];

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Siparişler</h1>
          <p className="text-sm text-gray-500">{filtered.length} sipariş</p>
        </div>
        <button onClick={load} className="btn-secondary text-xs">
          <RefreshCw size={14} />
          Yenile
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex flex-wrap gap-1">
          {[ALL, ...STATUS_OPTIONS].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                statusFilter === s
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {s === ALL ? "Tümü" : STATUS_LABELS[s as OrderStatus]}
            </button>
          ))}
        </div>
        <div className="relative ml-auto">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            className="input pl-8 text-xs py-2 w-52"
            placeholder="Ad, telefon, takip kodu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-emerald-600" size={28} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-gray-400">
          <p className="text-3xl">📋</p>
          <p className="mt-2 text-sm">Sipariş bulunamadı</p>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {["Takip Kodu", "Müşteri", "Hayvan", "Tutar", "Teslimat", "Randevu", "Durum", ""].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold text-gray-600"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-bold text-emerald-700">
                      {order.tracking_code}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">
                        {order.customers?.full_name}
                      </p>
                      <p className="text-xs text-gray-400">{order.customers?.phone}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-800">{order.animals?.name}</p>
                      <p className="text-xs text-gray-400">
                        {order.animals
                          ? ANIMAL_TYPE_LABELS[order.animals.type]
                          : ""}{" "}
                        &bull; {order.share_count} hisse
                      </p>
                    </td>
                    <td className="px-4 py-3 font-semibold text-emerald-700">
                      {formatCurrency(order.total_price)}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {DELIVERY_TYPE_LABELS[order.delivery_type].split(" ")[0]}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {order.appointment_datetime
                        ? formatDateTime(order.appointment_datetime)
                        : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${STATUS_COLORS[order.status as OrderStatus]}`}>
                        {STATUS_LABELS[order.status as OrderStatus]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setNewStatus(order.status as OrderStatus);
                        }}
                        className="text-xs text-emerald-600 hover:text-emerald-800 font-medium"
                      >
                        Güncelle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Durum Güncelle</h3>
              <button onClick={() => setSelectedOrder(null)}>
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              <strong>{selectedOrder.customers?.full_name}</strong> &mdash;{" "}
              {selectedOrder.tracking_code}
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Yeni Durum
              </label>
              <div className="grid grid-cols-2 gap-2">
                {STATUS_OPTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setNewStatus(s)}
                    className={`rounded-xl border px-3 py-2 text-xs font-medium transition-all ${
                      newStatus === s
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Not (opsiyonel)
              </label>
              <textarea
                className="input resize-none text-sm"
                rows={2}
                placeholder="Müşteri için bilgi notu..."
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleStatusUpdate}
                className="btn-primary flex-1"
                disabled={updatingStatus}
              >
                {updatingStatus ? (
                  <><Loader2 size={14} className="animate-spin" /> Kaydediliyor...</>
                ) : (
                  "Kaydet"
                )}
              </button>
              <button onClick={() => setSelectedOrder(null)} className="btn-secondary">
                İptal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
