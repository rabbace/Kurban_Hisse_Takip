"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Search, ArrowRight } from "lucide-react";

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
    <div className="min-h-screen">
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

        <p className="mt-6 text-xs text-gray-400">
          Takip kodu KRB- ile başlar ve 8 karakter içerir. <br />
          Örnek: KRB-AB3D7XYZ
        </p>
      </main>
    </div>
  );
}
