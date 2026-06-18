"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import { Order, DELIVERY_TYPE_LABELS } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";
import { Printer, RefreshCw, Loader2, CheckSquare, Square } from "lucide-react";
import { MOCK_ORDERS } from "@/lib/mock-data";

const DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
const SITE_URL =
  typeof window !== "undefined"
    ? window.location.origin
    : process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

function qrSrc(url: string) {
  // Static export: API routes unavailable, use public QR service
  if (DEMO) return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=4&data=${encodeURIComponent(url)}`;
  return `/api/qr?data=${encodeURIComponent(url)}`;
}

export default function AdminEtiketlerPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [printing, setPrinting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    if (DEMO) {
      const result = MOCK_ORDERS as unknown as Order[];
      setOrders(result);
      setSelected(new Set(result.map(o => o.id)));
      setLoading(false);
      return;
    }
    const supabase = createClient();
    const { data } = await supabase
      .from("orders")
      .select("*, customers(*), animals(*)")
      .neq("status", "iptal")
      .or(
        `appointment_datetime.gte.${selectedDate}T00:00:00,appointment_datetime.is.null`
      )
      .order("appointment_datetime", { nullsFirst: false })
      .order("created_at", { ascending: false })
      .limit(50);
    const result = (data as Order[]) ?? [];
    setOrders(result);
    setSelected(new Set(result.map((o) => o.id)));
    setLoading(false);
  }, [selectedDate]);

  useEffect(() => { load(); }, [load]);

  function toggleAll() {
    if (selected.size === orders.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(orders.map((o) => o.id)));
    }
  }

  function toggle(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  }

  function handlePrint() {
    setPrinting(true);
    setTimeout(() => {
      window.print();
      setPrinting(false);
    }, 200);
  }

  const printOrders = orders.filter((o) => selected.has(o.id));

  return (
    <>
      {/* Screen view */}
      <div className="p-6 space-y-4 print:hidden">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">QR Etiketler</h1>
            <p className="text-sm text-gray-500">
              Siparişleri seçin, hayvanların boynuna etiket takın
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={load} className="btn-secondary text-xs">
              <RefreshCw size={14} /> Yenile
            </button>
            <button
              onClick={handlePrint}
              className="btn-primary"
              disabled={selected.size === 0 || printing}
            >
              {printing ? (
                <><Loader2 size={16} className="animate-spin" /> Hazırlanıyor...</>
              ) : (
                <><Printer size={16} /> {selected.size} Etiket Bas</>
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-600">Randevu tarihi:</label>
          <input
            type="date"
            className="input text-sm py-2"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
          <span className="text-xs text-gray-400">(tarihi olmayan siparişler de listelenir)</span>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-red-600" size={28} />
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <p className="text-3xl">🏷️</p>
            <p className="mt-3 text-sm">Bu tarih için sipariş bulunamadı</p>
          </div>
        ) : (
          <div className="card overflow-hidden p-0">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-3">
              <button onClick={toggleAll} className="flex items-center gap-2 text-sm text-gray-600">
                {selected.size === orders.length ? (
                  <CheckSquare size={16} className="text-red-600" />
                ) : (
                  <Square size={16} />
                )}
                <span>{selected.size === orders.length ? "Tümünü kaldır" : "Tümünü seç"}</span>
              </button>
              <span className="text-xs text-gray-400">{selected.size}/{orders.length} seçili</span>
            </div>
            <div className="divide-y divide-gray-100">
              {orders.map((o) => (
                <div
                  key={o.id}
                  onClick={() => toggle(o.id)}
                  className={`flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selected.has(o.id) ? "bg-red-50/50" : ""
                  }`}
                >
                  <div className="shrink-0">
                    {selected.has(o.id) ? (
                      <CheckSquare size={18} className="text-red-600" />
                    ) : (
                      <Square size={18} className="text-gray-300" />
                    )}
                  </div>
                  {/* Mini QR preview */}
                  <img
                    src={`${qrSrc(`${SITE_URL}/takip/${o.tracking_code}`)}`}
                    alt="QR"
                    className="w-12 h-12 rounded-lg border border-gray-200"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{o.customers?.full_name}</p>
                    <p className="text-xs text-gray-500">
                      {o.customers?.phone} · {o.animals?.name} · {o.share_count} hisse
                    </p>
                    <p className="text-xs text-gray-400">
                      {o.appointment_datetime ? formatDateTime(o.appointment_datetime) : "Randevu yok"}{" "}
                      · {DELIVERY_TYPE_LABELS[o.delivery_type].split("(")[0]}
                    </p>
                  </div>
                  <p className="font-mono text-xs font-bold text-red-700 shrink-0">
                    {o.tracking_code}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="card bg-amber-50 border-amber-200">
          <p className="text-sm font-semibold text-amber-800 mb-2">📋 Kullanım Talimatı</p>
          <ol className="text-xs text-amber-700 space-y-1 list-decimal list-inside">
            <li>Basmak istediğiniz etiketleri seçin</li>
            <li>"Etiket Bas" butonuna tıklayın → tarayıcı yazdırma ekranı açılır</li>
            <li>A4 kağıda 4 etiket / sayfa şeklinde çıkar</li>
            <li>Etiketi hayvanın boynuna/kulağına klipsle takın</li>
            <li>Kesimden sonra aynı etiket et paketine yapıştırılır</li>
            <li>Müşteri QR'ı okutarak kesim durumunu takip eder</li>
          </ol>
        </div>
      </div>

      {/* Print layout — only visible when printing */}
      <div className="hidden print:block">
        <style>{`
          @page { size: A4; margin: 10mm; }
          @media print {
            body { margin: 0; padding: 0; }
            .print-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8mm; }
            .label { border: 1px solid #ccc; border-radius: 4mm; padding: 5mm; page-break-inside: avoid; }
          }
        `}</style>
        <div className="print-grid">
          {printOrders.map((o) => (
            <div key={o.id} className="label" style={{ minHeight: "60mm" }}>
              <div style={{ display: "flex", gap: "4mm", alignItems: "flex-start" }}>
                <img
                  src={`${qrSrc(`${SITE_URL}/takip/${o.tracking_code}`)}`}
                  alt="QR"
                  style={{ width: "30mm", height: "30mm", flexShrink: 0 }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: "monospace", fontSize: "9pt", fontWeight: "bold", color: "#059669", marginBottom: "2mm" }}>
                    {o.tracking_code}
                  </p>
                  <p style={{ fontSize: "11pt", fontWeight: "bold", marginBottom: "1mm" }}>
                    {o.customers?.full_name}
                  </p>
                  <p style={{ fontSize: "9pt", color: "#555", marginBottom: "1mm" }}>
                    📞 {o.customers?.phone}
                  </p>
                  <p style={{ fontSize: "9pt", color: "#333", marginBottom: "1mm" }}>
                    🐾 {o.animals?.name}
                  </p>
                  <p style={{ fontSize: "9pt", color: "#555", marginBottom: "1mm" }}>
                    {o.share_count} hisse · {DELIVERY_TYPE_LABELS[o.delivery_type].split("(")[0]}
                  </p>
                  {o.appointment_datetime && (
                    <p style={{ fontSize: "9pt", color: "#555" }}>
                      📅 {formatDateTime(o.appointment_datetime)}
                    </p>
                  )}
                  {o.notes && (
                    <p style={{ fontSize: "8pt", color: "#888", marginTop: "2mm", fontStyle: "italic" }}>
                      Not: {o.notes}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
