"use client";

import Link from "next/link";
import { Calendar, Scale, Users, ChevronRight } from "lucide-react";
import { Animal, ANIMAL_TYPE_LABELS } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";

const ANIMAL_EMOJIS: Record<string, string> = {
  koyun: "🐑",
  keci: "🐐",
  dana: "🐄",
  deve: "🐪",
};

const ANIMAL_BG: Record<string, string> = {
  koyun: "from-amber-50 to-orange-50",
  keci: "from-lime-50 to-green-50",
  dana: "from-emerald-50 to-teal-50",
  deve: "from-yellow-50 to-amber-50",
};

export default function AnimalCard({ animal }: { animal: Animal }) {
  const isSoldOut = animal.available_shares === 0;
  const isHisse = animal.total_shares > 1;

  return (
    <div
      className={`card overflow-hidden transition-all hover:shadow-md ${
        isSoldOut ? "opacity-60" : ""
      }`}
    >
      <div
        className={`-mx-5 -mt-5 mb-4 flex items-center justify-center overflow-hidden bg-gradient-to-br ${
          ANIMAL_BG[animal.type]
        } ${animal.image_url ? "" : "py-8"}`}
      >
        {animal.image_url ? (
          <img
            src={animal.image_url}
            alt={animal.name}
            className={`h-40 w-full object-cover ${isSoldOut ? "grayscale" : ""}`}
          />
        ) : (
          <span className="text-6xl">{ANIMAL_EMOJIS[animal.type]}</span>
        )}
      </div>

      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
            {ANIMAL_TYPE_LABELS[animal.type]}
          </p>
          <h3 className="mt-0.5 text-base font-bold text-gray-900">{animal.name}</h3>
        </div>
        {isSoldOut ? (
          <span className="badge bg-red-100 text-red-700 shrink-0">Tükendi</span>
        ) : isHisse ? (
          <span className="badge bg-emerald-100 text-emerald-700 shrink-0">
            {animal.available_shares} hisse kaldı
          </span>
        ) : (
          <span className="badge bg-green-100 text-green-700 shrink-0">Mevcut</span>
        )}
      </div>

      {animal.description && (
        <p className="mt-2 text-xs text-gray-500 line-clamp-2">{animal.description}</p>
      )}

      <div className="mt-3 space-y-1.5">
        {animal.weight_kg && (
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <Scale size={12} className="text-gray-400" />
            <span>{animal.weight_kg} kg</span>
          </div>
        )}
        {isHisse && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-gray-600">
              <div className="flex items-center gap-1.5">
                <Users size={12} className="text-gray-400" />
                <span>{animal.total_shares} hisse</span>
              </div>
              <span className="font-semibold text-emerald-700">
                {animal.available_shares} mevcut
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  animal.available_shares === 0
                    ? "bg-red-400"
                    : animal.available_shares <= Math.ceil(animal.total_shares * 0.3)
                    ? "bg-orange-400"
                    : "bg-emerald-500"
                }`}
                style={{
                  width: `${
                    ((animal.total_shares - animal.available_shares) / animal.total_shares) * 100
                  }%`,
                }}
              />
            </div>
            <p className="text-right text-xs text-gray-400">
              {animal.total_shares - animal.available_shares}/{animal.total_shares} satıldı
            </p>
          </div>
        )}
        {animal.slaughter_date && (
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <Calendar size={12} className="text-gray-400" />
            <span>Kesim: {formatDate(animal.slaughter_date)}</span>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
        <div>
          <p className="text-xs text-gray-500">{isHisse ? "Hisse başına" : "Fiyat"}</p>
          <p className="text-lg font-bold text-emerald-700">
            {formatCurrency(animal.price_per_share)}
          </p>
        </div>
        {!isSoldOut && (
          <Link
            href={`/siparis?animal_id=${animal.id}`}
            className="btn-primary text-xs"
          >
            {isHisse ? "Hisse Al" : "Satın Al"}
            <ChevronRight size={14} />
          </Link>
        )}
      </div>
    </div>
  );
}
