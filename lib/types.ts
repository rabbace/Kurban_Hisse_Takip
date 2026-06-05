export type AnimalType = "koyun" | "keci" | "dana" | "deve";

export type OrderStatus =
  | "beklemede"
  | "onaylandi"
  | "kesim_basladi"
  | "kesildi"
  | "teslim_edildi"
  | "iptal";

export type DeliveryType = "yerinde_kesim" | "paket_et" | "uzerime_birak";

export interface Animal {
  id: string;
  name: string;
  type: AnimalType;
  weight_kg: number | null;
  total_shares: number;
  available_shares: number;
  price_per_share: number;
  description: string | null;
  image_url: string | null;
  slaughter_date: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Customer {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  address: string | null;
  tc_no: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  tracking_code: string;
  customer_id: string;
  animal_id: string;
  share_count: number;
  order_type: "hisse" | "tam_hayvan";
  total_price: number;
  status: OrderStatus;
  appointment_datetime: string | null;
  slaughter_started_at: string | null;
  slaughter_completed_at: string | null;
  delivery_type: DeliveryType;
  notes: string | null;
  created_at: string;
  customers?: Customer;
  animals?: Animal;
}

export interface SlaughterLog {
  id: string;
  order_id: string;
  status: OrderStatus;
  note: string | null;
  created_at: string;
}

export const ANIMAL_TYPE_LABELS: Record<AnimalType, string> = {
  koyun: "Koyun",
  keci: "Keçi",
  dana: "Dana/İnek",
  deve: "Deve",
};

export const STATUS_LABELS: Record<OrderStatus, string> = {
  beklemede: "Beklemede",
  onaylandi: "Onaylandı",
  kesim_basladi: "Kesim Başladı",
  kesildi: "Kesildi",
  teslim_edildi: "Teslim Edildi",
  iptal: "İptal",
};

export const STATUS_COLORS: Record<OrderStatus, string> = {
  beklemede: "bg-yellow-100 text-yellow-800",
  onaylandi: "bg-blue-100 text-blue-800",
  kesim_basladi: "bg-orange-100 text-orange-800",
  kesildi: "bg-purple-100 text-purple-800",
  teslim_edildi: "bg-green-100 text-green-800",
  iptal: "bg-red-100 text-red-800",
};

export const DELIVERY_TYPE_LABELS: Record<DeliveryType, string> = {
  yerinde_kesim: "Yerinde Kesim (Adreste)",
  paket_et: "Paket Et (Kestikten Sonra Al)",
  uzerime_birak: "Üzerime Bırak (Firmada Kal)",
};
