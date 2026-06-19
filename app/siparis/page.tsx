"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import DemoBanner from "@/components/DemoBanner";
import StickyCallBar from "@/components/StickyCallBar";
import { createClient } from "@/lib/supabase";
import {
  Animal,
  ANIMAL_TYPE_LABELS,
  DELIVERY_TYPE_LABELS,
  DeliveryType,
  PAYMENT_TYPE_LABELS,
  PaymentType,
} from "@/lib/types";
import { MOCK_ANIMALS } from "@/lib/mock-data";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CheckCircle2, Copy, ChevronLeft, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";

const DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

function SiparisContent() {
  const params = useSearchParams();
  const router = useRouter();
  const animalId = params?.get("animal_id") ?? null;

  const [animal, setAnimal] = useState<Animal | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [trackingCode, setTrackingCode] = useState("");

  const [shareCount, setShareCount] = useState(1);
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    email: "",
    tc_no: "",
    address: "",
    delivery_type: "paket_et" as DeliveryType,
    payment_type: "sonra" as PaymentType,
    appointment_datetime: "",
    notes: "",
  });

  useEffect(() => {
    if (!animalId) { router.push("/"); return; }
    if (DEMO) {
      const found = MOCK_ANIMALS.find((a) => a.id === animalId) ?? MOCK_ANIMALS[0];
      setAnimal(found);
      setLoading(false);
      return;
    }
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("animals")
        .select("*")
        .eq("id", animalId)
        .single();
      if (!data) { router.push("/"); return; }
      setAnimal(data);
      setLoading(false);
    }
    load();
  }, [animalId, router]);

  const isHisse = animal && animal.total_shares > 1;
  const totalPrice = animal ? animal.price_per_share * shareCount : 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!animal) return;
    if (!form.full_name.trim() || !form.phone.trim()) {
      setError("Ad soyad ve telefon alanları zorunludur.");
      return;
    }
    setSubmitting(true);
    setError("");

    if (DEMO) {
      await new Promise((r) => setTimeout(r, 800));
      setTrackingCode("KRB-DEMO1234");
      setSubmitting(false);
      return;
    }

    const res = await fetch("/api/orders/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        animal_id: animal.id,
        share_count: shareCount,
        full_name: form.full_name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || null,
        tc_no: form.tc_no.trim() || null,
        address: form.address.trim() || null,
        delivery_type: form.delivery_type,
        payment_type: form.payment_type,
        appointment_datetime: form.appointment_datetime || null,
        notes: form.notes.trim() || null,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Sipariş oluşturulamadı.");
      setSubmitting(false);
      return;
    }

    setTrackingCode(data.tracking_code);
    setSubmitting(false);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="animate-spin text-red-600" size={32} />
      </div>
    );
  }

  if (trackingCode) {
    return (
      <div className="flex min-h-screen flex-col pb-14 sm:pb-0">
        {DEMO && <DemoBanner />}
        <Navbar />
        <main className="mx-auto w-full max-w-lg px-4 py-16 text-center">
          <CheckCircle2 size={64} className="mx-auto text-red-500" />
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Siparişiniz Alındı!</h1>
          <p className="mt-2 text-gray-600">
            Takip kodunuzu saklayın. Bu kod ile siparişinizi takip edebilirsiniz.
          </p>
          <div className="mt-6 rounded-2xl bg-red-50 p-6">
            <p className="text-sm text-red-700">Takip Kodunuz</p>
            <p className="mt-1 text-3xl font-black tracking-widest text-red-900">
              {trackingCode}
            </p>
            <button
              onClick={() => navigator.clipboard.writeText(trackingCode)}
              className="btn-secondary mt-3 text-xs"
            >
              <Copy size={12} />
              Kopyala
            </button>
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href={`/takip/${trackingCode}`} className="btn-primary">
              Siparişimi Takip Et
            </Link>
            <Link href="/" className="btn-secondary">
              Ana Sayfa
            </Link>
          </div>
        </main>
        <StickyCallBar />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-14 sm:pb-0">
      {DEMO && <DemoBanner />}
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <Link href="/" className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <ChevronLeft size={16} />
          Geri Dön
        </Link>

        {/* Animal Summary */}
        <div className="card mb-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-red-600">
            {ANIMAL_TYPE_LABELS[animal!.type]}
          </p>
          <h2 className="mt-1 text-xl font-bold">{animal!.name}</h2>
          <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600">
            {animal!.weight_kg && <span>⚖️ {animal!.weight_kg} kg</span>}
            {animal!.slaughter_date && (
              <span>📅 Kesim: {formatDate(animal!.slaughter_date)}</span>
            )}
            <span>🟢 {animal!.available_shares} hisse mevcut</span>
          </div>
          {isHisse && (
            <div className="mt-4">
              <label className="text-sm font-medium text-gray-700">Hisse Sayısı</label>
              <div className="mt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShareCount(Math.max(1, shareCount - 1))}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 text-lg font-bold hover:bg-gray-50"
                >
                  -
                </button>
                <span className="w-8 text-center text-lg font-bold">{shareCount}</span>
                <button
                  type="button"
                  onClick={() =>
                    setShareCount(Math.min(animal!.available_shares, shareCount + 1))
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 text-lg font-bold hover:bg-gray-50"
                >
                  +
                </button>
                <span className="text-sm text-gray-500">
                  (max {animal!.available_shares})
                </span>
              </div>
            </div>
          )}
          <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
            <p className="text-sm text-gray-500">Toplam Tutar</p>
            <p className="text-2xl font-extrabold text-red-700">
              {formatCurrency(totalPrice)}
            </p>
          </div>
        </div>

        {/* Order Form */}
        <form onSubmit={handleSubmit} className="card space-y-4">
          <h3 className="text-base font-bold text-gray-900">Kişisel Bilgiler</h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Ad Soyad <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="input"
                placeholder="Ahmet Yılmaz"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Telefon <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                className="input"
                placeholder="05xx xxx xx xx"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                E-posta
              </label>
              <input
                type="email"
                className="input"
                placeholder="ornek@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                TC Kimlik No
              </label>
              <input
                type="text"
                className="input"
                placeholder="11 haneli TC No"
                maxLength={11}
                value={form.tc_no}
                onChange={(e) => setForm({ ...form, tc_no: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Adres</label>
            <textarea
              className="input resize-none"
              rows={2}
              placeholder="Mahalle, Cadde, Sokak, Kapı No, İlçe / İl"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>

          <div className="border-t border-gray-100 pt-4">
            <h3 className="mb-3 text-base font-bold text-gray-900">Teslimat Tercihi</h3>
            <div className="space-y-2">
              {(Object.entries(DELIVERY_TYPE_LABELS) as [DeliveryType, string][]).map(
                ([value, label]) => (
                  <label
                    key={value}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-all ${
                      form.delivery_type === value
                        ? "border-red-500 bg-red-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="delivery_type"
                      value={value}
                      checked={form.delivery_type === value}
                      onChange={() => setForm({ ...form, delivery_type: value })}
                      className="accent-red-600"
                    />
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                  </label>
                )
              )}
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <h3 className="mb-3 text-base font-bold text-gray-900">Ödeme Tercihi</h3>
            <div className="space-y-2">
              {(Object.entries(PAYMENT_TYPE_LABELS) as [PaymentType, string][]).map(
                ([value, label]) => (
                  <label
                    key={value}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-all ${
                      form.payment_type === value
                        ? "border-red-500 bg-red-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment_type"
                      value={value}
                      checked={form.payment_type === value}
                      onChange={() => setForm({ ...form, payment_type: value })}
                      className="accent-red-600"
                    />
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                  </label>
                )
              )}
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Tercih Ettiğiniz Kesim Tarihi / Saati
            </label>
            <input
              type="datetime-local"
              className="input"
              value={form.appointment_datetime}
              onChange={(e) => setForm({ ...form, appointment_datetime: e.target.value })}
            />
            <p className="mt-1 text-xs text-gray-400">
              Onay sonrası size kesin randevu bilgisi iletilecektir.
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Notlarınız
            </label>
            <textarea
              className="input resize-none"
              rows={2}
              placeholder="Özel talepleriniz varsa belirtin..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <button type="submit" className="btn-primary w-full py-3" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Sipariş Oluşturuluyor...
              </>
            ) : (
              <>Siparişi Tamamla &bull; {formatCurrency(totalPrice)}</>
            )}
          </button>
        </form>
      </main>
      <StickyCallBar />
    </div>
  );
}

export default function SiparisPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Loader2 className="animate-spin text-red-600" size={32} /></div>}>
      <SiparisContent />
    </Suspense>
  );
}
