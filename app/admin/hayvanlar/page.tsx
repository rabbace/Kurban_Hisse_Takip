"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import { Animal, AnimalType, ANIMAL_TYPE_LABELS } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Plus, Edit2, Trash2, Loader2, X, Save } from "lucide-react";
import { MOCK_ANIMALS } from "@/lib/mock-data";

const DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
const emptyAnimal: Omit<Animal, "id" | "created_at"> = {
  name: "",
  type: "koyun",
  weight_kg: null,
  total_shares: 1,
  available_shares: 1,
  price_per_share: 0,
  description: null,
  image_url: null,
  slaughter_date: null,
  is_active: true,
};

export default function AdminHayvanlarPage() {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Animal | null>(null);
  const [form, setForm] = useState(emptyAnimal);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    if (DEMO) {
      setAnimals(MOCK_ANIMALS);
      setLoading(false);
      return;
    }
    const supabase = createClient();
    const { data } = await supabase
      .from("animals")
      .select("*")
      .order("type")
      .order("name");
    setAnimals((data as Animal[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function openAdd() {
    setEditing(null);
    setForm(emptyAnimal);
    setShowForm(true);
  }

  function openEdit(animal: Animal) {
    setEditing(animal);
    setForm({
      name: animal.name,
      type: animal.type,
      weight_kg: animal.weight_kg,
      total_shares: animal.total_shares,
      available_shares: animal.available_shares,
      price_per_share: animal.price_per_share,
      description: animal.description,
      image_url: animal.image_url,
      slaughter_date: animal.slaughter_date,
      is_active: animal.is_active,
    });
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.name || !form.price_per_share) return;
    setSaving(true);
    if (DEMO) {
      await new Promise(r => setTimeout(r, 500));
      setSaving(false);
      setShowForm(false);
      return;
    }
    const supabase = createClient();

    const payload = {
      ...form,
      weight_kg: form.weight_kg || null,
      description: form.description || null,
      image_url: form.image_url || null,
      slaughter_date: form.slaughter_date || null,
    };

    if (editing) {
      await supabase.from("animals").update(payload).eq("id", editing.id);
    } else {
      await supabase.from("animals").insert(payload);
    }

    setSaving(false);
    setShowForm(false);
    load();
  }

  async function handleDelete(id: string) {
    if (DEMO) { setDeleteId(null); return; }
    const supabase = createClient();
    await supabase.from("animals").update({ is_active: false }).eq("id", id);
    setDeleteId(null);
    load();
  }

  const TYPES: AnimalType[] = ["koyun", "keci", "dana", "deve"];

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Hayvanlar</h1>
          <p className="text-sm text-gray-500">{animals.length} hayvan</p>
        </div>
        <button onClick={openAdd} className="btn-primary">
          <Plus size={16} />
          Hayvan Ekle
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-emerald-600" size={28} />
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {["Adı", "Tür", "Ağırlık", "Hisse", "Fiyat/Hisse", "Kesim Tarihi", "Durum", ""].map(
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
                {animals.map((a) => (
                  <tr key={a.id} className={`hover:bg-gray-50 ${!a.is_active ? "opacity-50" : ""}`}>
                    <td className="px-4 py-3 font-medium text-gray-900">{a.name}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {ANIMAL_TYPE_LABELS[a.type]}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {a.weight_kg ? `${a.weight_kg} kg` : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-semibold ${
                          a.available_shares === 0
                            ? "text-red-600"
                            : "text-emerald-700"
                        }`}
                      >
                        {a.available_shares}/{a.total_shares}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-emerald-700">
                      {formatCurrency(a.price_per_share)}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {formatDate(a.slaughter_date)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`badge ${
                          a.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {a.is_active ? "Aktif" : "Pasif"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(a)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteId(a.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-400"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-900">
                {editing ? "Hayvan Düzenle" : "Yeni Hayvan Ekle"}
              </h3>
              <button onClick={() => setShowForm(false)}>
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Hayvan Adı <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="input text-sm"
                    placeholder="Büyük Dana 1"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Tür</label>
                  <select
                    className="input text-sm"
                    value={form.type}
                    onChange={(e) => {
                      const t = e.target.value as AnimalType;
                      const shares = t === "dana" || t === "deve" ? 7 : 1;
                      setForm({
                        ...form,
                        type: t,
                        total_shares: shares,
                        available_shares: shares,
                      });
                    }}
                  >
                    {TYPES.map((t) => (
                      <option key={t} value={t}>
                        {ANIMAL_TYPE_LABELS[t]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Ağırlık (kg)
                  </label>
                  <input
                    type="number"
                    className="input text-sm"
                    placeholder="350"
                    value={form.weight_kg ?? ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        weight_kg: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Toplam Hisse
                  </label>
                  <input
                    type="number"
                    className="input text-sm"
                    min={1}
                    max={7}
                    value={form.total_shares}
                    onChange={(e) =>
                      setForm({ ...form, total_shares: Number(e.target.value) })
                    }
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Mevcut Hisse
                  </label>
                  <input
                    type="number"
                    className="input text-sm"
                    min={0}
                    max={form.total_shares}
                    value={form.available_shares}
                    onChange={(e) =>
                      setForm({ ...form, available_shares: Number(e.target.value) })
                    }
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Hisse Fiyatı (₺) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    className="input text-sm"
                    placeholder="8500"
                    value={form.price_per_share || ""}
                    onChange={(e) =>
                      setForm({ ...form, price_per_share: Number(e.target.value) })
                    }
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Kesim Tarihi
                  </label>
                  <input
                    type="date"
                    className="input text-sm"
                    value={form.slaughter_date ?? ""}
                    onChange={(e) =>
                      setForm({ ...form, slaughter_date: e.target.value || null })
                    }
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Açıklama
                  </label>
                  <textarea
                    className="input text-sm resize-none"
                    rows={2}
                    value={form.description ?? ""}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value || null })
                    }
                  />
                </div>

                <div className="col-span-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                    className="accent-emerald-600"
                  />
                  <label htmlFor="is_active" className="text-sm text-gray-700">
                    Aktif (sitede göster)
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={handleSave} className="btn-primary flex-1" disabled={saving}>
                  {saving ? (
                    <><Loader2 size={14} className="animate-spin" /> Kaydediliyor...</>
                  ) : (
                    <><Save size={14} /> Kaydet</>
                  )}
                </button>
                <button onClick={() => setShowForm(false)} className="btn-secondary">
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="font-bold text-gray-900 mb-2">Hayvanı Pasife Al</h3>
            <p className="text-sm text-gray-600 mb-5">
              Bu hayvan sitede görünmez hale getirilecek. Mevcut siparişler etkilenmez.
            </p>
            <div className="flex gap-3">
              <button onClick={() => handleDelete(deleteId)} className="btn-danger flex-1">
                Pasife Al
              </button>
              <button onClick={() => setDeleteId(null)} className="btn-secondary">
                İptal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
