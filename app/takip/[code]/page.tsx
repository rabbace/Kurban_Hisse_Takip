"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase";
import { Order, OrderStatus, STATUS_LABELS, ANIMAL_TYPE_LABELS, DELIVERY_TYPE_LABELS } from "@/lib/types";
import { formatCurrency, formatDateTime, formatDate } from "@/lib/utils";
import { CheckCircle2, Circle, Loader2, AlertCircle, Phone, Calendar, MapPin } from "lucide-react";
import Link from "next/link";

const STATUS_STEPS: OrderStatus[] = [
  "beklemede",
  "onaylandi",
  "kesim_basladi",
  "kesildi",
  "teslim_edildi",
];

export default function TakipDetayPage() {
  const { code } = useParams<{ code: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("orders")
        .select("*, customers(*), animals(*)")
        .eq("tracking_code", code.toUpperCase())
        .single();

      if (!data) { setNotFound(true); setLoading(false); return; }
      setOrder(data as Order);
      setLoading(false);
    }
    load();
  }, [code]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="animate-spin text-emerald-600" size={32} />
        </div>
      </div>
    );
  }

  if (notFound || !order) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="mx-auto max-w-md px-4 py-20 text-center">
          <AlertCircle size={56} className="mx-auto text-red-400" />
          <h1 className="mt-4 text-xl font-bold text-gray-900">Sipariş Bulunamadı</h1>
          <p className="mt-2 text-gray-500">
            <strong>{code}</strong> koduna ait sipariş bulunamadı.
          </p>
          <Link href="/takip" className="btn-primary mt-6">
            Tekrar Dene
          </Link>
        </div>
      </div>
    );
  }

  const isCancelled = order.status === "iptal";
  const currentStepIndex = isCancelled
    ? -1
    : STATUS_STEPS.indexOf(order.status as OrderStatus);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-8">
        {/* Header */}
        <div className="card mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-gray-500">Takip Kodu</p>
            <p className="text-xl font-black tracking-widest text-emerald-700">
              {order.tracking_code}
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Sipariş Tarihi: {formatDateTime(order.created_at)}
            </p>
          </div>
          {isCancelled ? (
            <span className="badge bg-red-100 text-red-700 text-sm">İptal Edildi</span>
          ) : (
            <span className="badge bg-emerald-100 text-emerald-800 text-sm">
              {STATUS_LABELS[order.status as OrderStatus]}
            </span>
          )}
        </div>

        {/* Progress Steps */}
        {!isCancelled && (
          <div className="card mb-4">
            <h3 className="mb-4 text-sm font-semibold text-gray-700">Kesim Süreci</h3>
            <div className="space-y-3">
              {STATUS_STEPS.map((step, idx) => {
                const isDone = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;
                return (
                  <div key={step} className="flex items-center gap-3">
                    <div className="shrink-0">
                      {isDone ? (
                        <CheckCircle2 size={20} className="text-emerald-500" />
                      ) : (
                        <Circle size={20} className="text-gray-300" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p
                        className={`text-sm font-medium ${
                          isCurrent
                            ? "text-emerald-700"
                            : isDone
                            ? "text-gray-700"
                            : "text-gray-400"
                        }`}
                      >
                        {STATUS_LABELS[step]}
                      </p>
                    </div>
                    {isCurrent && (
                      <span className="badge bg-emerald-100 text-emerald-700 animate-pulse">
                        Şu an
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Order Details */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="card">
            <h3 className="mb-3 text-sm font-semibold text-gray-700">Hayvan Bilgisi</h3>
            {order.animals ? (
              <div className="space-y-1.5 text-sm">
                <p className="font-medium text-gray-900">{order.animals.name}</p>
                <p className="text-gray-500">
                  {ANIMAL_TYPE_LABELS[order.animals.type]}
                  {order.animals.weight_kg && ` • ${order.animals.weight_kg} kg`}
                </p>
                <p className="text-gray-500">
                  {order.order_type === "hisse"
                    ? `${order.share_count} hisse`
                    : "Tam Hayvan"}
                </p>
                {order.animals.slaughter_date && (
                  <p className="text-gray-500">
                    Kesim: {formatDate(order.animals.slaughter_date)}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-400">Bilgi yok</p>
            )}
          </div>

          <div className="card">
            <h3 className="mb-3 text-sm font-semibold text-gray-700">Sipariş Özeti</h3>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Tutar</span>
                <span className="font-bold text-emerald-700">
                  {formatCurrency(order.total_price)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Teslimat</span>
                <span className="text-right text-gray-700">
                  {DELIVERY_TYPE_LABELS[order.delivery_type]}
                </span>
              </div>
              {order.appointment_datetime && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Randevu</span>
                  <span className="text-gray-700">
                    {formatDateTime(order.appointment_datetime)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {order.customers && (
            <div className="card sm:col-span-2">
              <h3 className="mb-3 text-sm font-semibold text-gray-700">İletişim</h3>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone size={14} className="text-gray-400" />
                  {order.customers.full_name} &bull; {order.customers.phone}
                </div>
                {order.customers.address && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin size={14} className="text-gray-400" />
                    {order.customers.address}
                  </div>
                )}
              </div>
            </div>
          )}

          {order.notes && (
            <div className="card sm:col-span-2 bg-amber-50 border-amber-200">
              <p className="text-xs font-semibold text-amber-700 mb-1">Notlar</p>
              <p className="text-sm text-amber-900">{order.notes}</p>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link href="/takip" className="btn-secondary text-sm">
            Başka Sipariş Sorgula
          </Link>
        </div>
      </main>
    </div>
  );
}
