"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import DemoBanner from "@/components/DemoBanner";
import StickyCallBar from "@/components/StickyCallBar";
import { Search, ArrowRight } from "lucide-react";

const DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

const DEMO_CODES = [
  { code: "KRB-DEMO1234", label: "Kesim Başladı" },
  { code: "KRB-DEMO5678", label: "Onaylandı" },
  { code: "KRB-DEMO9012", label: "Kesildi" },
  { code: "KRB-DEMO7890", label: "Teslim Edildi" },
];

export default function TakipPage() {
  const router = useRouter();
  const [code, setCode] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    router.push(`/takip/${trimmed}`);
  }

  return (
    <div className="min-h-screen pb-14 sm:pb-0">
      {DEMO && <DemoBanner />}
      <Navbar />
      <main className="mx-auto max-w-lg px-4 py-20 text-center">
        <span className="text-5xl">📦</span>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">Sipariş Takip</h1>
        <p className="mt-2 text-gray-500">
          Siparişinizi oluştururken aldığınız takip kodunu girerek kesim durumunu öğrenin.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 card">
          <label className="block text-sm font-medium text-gray-700 text-left mb-2">
            Takip Kodu
          </label>
          <input
            type="text"
            className="input text-center text-lg font-bold tracking-widest uppercase"
            placeholder="KRB-XXXXXXXX"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            maxLength={12}
          />
          <button type="submit" className="btn-primary w-full mt-4 py-3">
            <Search size={16} />
            Sipariş Sorgula
            <ArrowRight size={16} />
          </button>
        </form>

        {DEMO && (
          <div className="mt-6 rounded-xl bg-amber-50 border border-amber-200 p-4 text-left">
            <p className="text-xs font-semibold text-amber-800 mb-2">🔍 Demo takip kodları:</p>
            <div className="space-y-1.5">
              {DEMO_CODES.map(({ code: c, label }) => (
                <button
                  key={c}
                  onClick={() => router.push(`/takip/${c}`)}
                  className="flex items-center justify-between w-full rounded-lg bg-white border border-amber-200 px-3 py-2 hover:border-red-400 transition-colors"
                >
                  <span className="font-mono text-sm font-bold text-red-700">{c}</span>
                  <span className="text-xs text-gray-500">{label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {!DEMO && (
          <p className="mt-6 text-xs text-gray-400">
            Takip kodu KRB- ile başlar ve 8 karakter içerir. <br />
            Örnek: KRB-AB3D7XYZ
          </p>
        )}
      </main>
      <StickyCallBar />
    </div>
  );
}
