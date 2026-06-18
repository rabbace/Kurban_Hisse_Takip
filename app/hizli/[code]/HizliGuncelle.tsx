"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { MOCK_ORDERS } from "@/lib/mock-data";
import {
  Order,
  OrderStatus,
  STATUS_LABELS,
  STATUS_COLORS,
  ANIMAL_TYPE_LABELS,
  DELIVERY_TYPE_LABELS,
} from "@/lib/types";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { ArrowLeft, Check, Loader2, AlertCircle, ExternalLink } from "lucide-react";

const DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

const QUICK_STATUSES: OrderStatus[] = [
  "beklemede", "onaylandi", "kesim_basladi", "kesildi", "teslim_edildi",
];

export default function HizliGuncelleClient() {
  const params = useParams<{ code: string }>();
  const router = useRouter();
  const code = (Array.isArray(params?.code) ? params.code[0] : params?.code) ?? "";

  const [checkingAuth, setCheckingAuth] = useState(!DEMO);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [updating, setUpdating] = useState<OrderStatus | null>(null);

  const upperCode = code.toUpperCase();

  const load = useCallback(async () => {
    setLoading(true);
    if (DEMO) {
      const found = MOCK_ORDERS.find((o) => o.tracking_code === upperCode);
      if (found) setOrder(found as Order);
      else setNotFound(true);
      setLoading(false);
      return;
    }
    const supabase = createClient();
    const { data } = await supabase
      .from("orders")
      .select("*, customers(*), animals(*)")
      .eq("tracking_code", upperCode)
      .single();
    if (!data) { setNotFound(true); setLoading(false); return; }
    setOrder(data as Order);
    setLoading(false);
  }, [upperCode]);

  // Only logged-in admins should see the quick-action panel. Anyone else
  // scanning the same tag (i.e. the customer) lands on their tracking page.
  useEffect(() => {
    if (DEMO) { load(); return; }
    async function checkAuth() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace(`/takip/${upperCode}`); return; }
      setCheckingAuth(false);
      load();
    }
    checkAuth();
  }, [load, router, upperCode]);

  async function handleTap(status: OrderStatus) {
    if (!order || status === order.status) return;
    setUpdating(status);

    if (DEMO) {
      await new Promise((r) => setTimeout(r, 400));
      setOrder({ ...order, status });
      setUpdating(null);
      return;
    }

    await fetch("/api/orders/update-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order_id: order.id, status }),
    });
    setOrder({ ...order, status });
    setUpdating(null);
  }

  if (checkingAuth || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-red-600" size={32} />
      </div>
    );
  }

  if (notFound || !order) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
        <AlertCircle size={48} className="text-red-400" />
        <h1 className="mt-4 text-lg font-bold text-gray-900">Sipariş Bulunamadı</h1>
        <p className="mt-1 text-sm text-gray-500"><strong>{upperCode}</strong> koduna ait sipariş yok.</p>
        <Link href="/admin/siparisler" className="btn-secondary mt-6">
          <ArrowLeft size={16} /> Siparişlere Dön
        </Link>
      </div>
    );
  }

  const isCancelled = order.status === "iptal";

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <header className="bg-red-700 px-4 py-3">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <Link href="/admin/siparisler" className="flex items-center gap-1 text-sm font-medium text-red-100 hover:text-white">
            <ArrowLeft size={16} /> Siparişler
          </Link>
          <p className="text-sm font-bold text-white">Hızlı Güncelle</p>
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 py-5 space-y-4">
        <div className="card">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-mono text-xs font-bold text-red-700">{order.tracking_code}</p>
              <p className="mt-1 text-lg font-bold text-gray-900">{order.customers?.full_name}</p>
              <p className="text-sm text-gray-500">{order.customers?.phone}</p>
            </div>
            <span className={`badge ${STATUS_COLORS[order.status as OrderStatus]}`}>
              {STATUS_LABELS[order.status as OrderStatus]}
            </span>
          </div>
          <div className="mt-3 border-t border-gray-100 pt-3 text-sm text-gray-600 space-y-1">
            <p>
              {order.animals ? ANIMAL_TYPE_LABELS[order.animals.type] : ""} · {order.animals?.name} · {order.share_count} hisse
            </p>
            <p>{DELIVERY_TYPE_LABELS[order.delivery_type]}</p>
            {order.appointment_datetime && <p>Randevu: {formatDateTime(order.appointment_datetime)}</p>}
            <p className="font-semibold text-red-700">{formatCurrency(order.total_price)}</p>
          </div>
        </div>

        {isCancelled ? (
          <div className="card bg-red-50 border-red-200 text-center text-sm text-red-700">
            Bu sipariş iptal edilmiş.
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Durumu güncelle (dokunun)
            </p>
            {QUICK_STATUSES.map((status) => {
              const isCurrent = order.status === status;
              const isUpdating = updating === status;
              return (
                <button
                  key={status}
                  onClick={() => handleTap(status)}
                  disabled={isCurrent || updating !== null}
                  className={`flex w-full items-center justify-between rounded-2xl border px-4 py-4 text-left transition-all active:scale-[0.98] ${
                    isCurrent
                      ? "border-red-500 bg-red-50"
                      : "border-gray-200 bg-white hover:border-red-300"
                  } disabled:opacity-60`}
                >
                  <span className={`font-semibold ${isCurrent ? "text-red-700" : "text-gray-800"}`}>
                    {STATUS_LABELS[status]}
                  </span>
                  {isUpdating ? (
                    <Loader2 size={18} className="animate-spin text-red-600" />
                  ) : isCurrent ? (
                    <Check size={18} className="text-red-600" />
                  ) : null}
                </button>
              );
            })}
            <p className="pt-1 text-xs text-gray-400">
              Her dokunuş müşteriye otomatik SMS gönderir.
            </p>
          </div>
        )}

        <Link
          href={`/takip/${order.tracking_code}`}
          target="_blank"
          className="flex items-center justify-center gap-2 text-xs text-gray-400 hover:text-gray-600"
        >
          Müşteri görünümünü gör <ExternalLink size={12} />
        </Link>
      </main>
    </div>
  );
}
