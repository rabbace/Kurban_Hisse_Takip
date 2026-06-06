"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import AnimalCard from "@/components/AnimalCard";
import DemoBanner from "@/components/DemoBanner";
import { createClient } from "@/lib/supabase";
import { Animal, AnimalType, ANIMAL_TYPE_LABELS } from "@/lib/types";
import { MOCK_ANIMALS } from "@/lib/mock-data";
import { Search } from "lucide-react";

const DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
const ALL_FILTER = "hepsi";

export default function HomePage() {
  const [animals, setAnimals] = useState<Animal[]>(DEMO ? MOCK_ANIMALS : []);
  const [loading, setLoading] = useState(!DEMO);
  const [filter, setFilter] = useState<string>(ALL_FILTER);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (DEMO) return;
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("animals")
        .select("*")
        .eq("is_active", true)
        .order("type")
        .order("name");
      setAnimals(data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const animalTypes = [ALL_FILTER, ...Array.from(new Set(animals.map((a) => a.type)))];

  const filtered = animals.filter((a) => {
    const matchType = filter === ALL_FILTER || a.type === filter;
    const matchSearch =
      !searchQuery ||
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ANIMAL_TYPE_LABELS[a.type as AnimalType]
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <div className="min-h-screen">
      {DEMO && <DemoBanner />}
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-700 to-emerald-900 py-14 text-white">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <p className="mb-2 text-sm font-medium uppercase tracking-widest text-emerald-300">
            Kurban Bayramı 2025
          </p>
          <h1 className="text-3xl font-extrabold sm:text-4xl">
            Kurbanlık Hayvan ve Hisse Satışı
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-emerald-200">
            Güvenli, şeffaf ve kolay. Online sipariş verin, randevu alın, kesim sürecini
            anlık takip edin.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-6 text-sm">
            <div className="flex items-center gap-2"><span>✅</span><span>Sağlık sertifikalı hayvanlar</span></div>
            <div className="flex items-center gap-2"><span>📍</span><span>Adrese teslim seçeneği</span></div>
            <div className="flex items-center gap-2"><span>📱</span><span>Anlık takip sistemi</span></div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="border-b border-gray-200 bg-white py-4 shadow-sm">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {animalTypes.map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                  filter === type
                    ? "bg-emerald-600 text-white shadow"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {type === ALL_FILTER ? "Tümü" : ANIMAL_TYPE_LABELS[type as AnimalType] ?? type}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Hayvan ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-8 text-sm w-full sm:w-52"
            />
          </div>
        </div>
      </section>

      {/* Animal Grid */}
      <main className="mx-auto max-w-6xl px-4 py-8">
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="mb-4 h-32 rounded-xl bg-gray-200" />
                <div className="h-4 w-2/3 rounded bg-gray-200" />
                <div className="mt-2 h-3 w-1/2 rounded bg-gray-200" />
                <div className="mt-4 h-8 rounded bg-gray-200" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-gray-500">
            <p className="text-4xl">🔍</p>
            <p className="mt-3 font-medium">Sonuç bulunamadı</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((animal) => (
              <AnimalCard key={animal.id} animal={animal} />
            ))}
          </div>
        )}
      </main>

      <footer className="mt-16 border-t border-gray-200 bg-white py-8">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm text-gray-500">
          <p className="font-semibold text-gray-700">İzgara İzgara — Kurban Hisse Takip Sistemi</p>
          <p className="mt-1">
            Sorularınız için{" "}
            <a href="tel:+905001234567" className="text-emerald-600 hover:underline">0500 123 45 67</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
