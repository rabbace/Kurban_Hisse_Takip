-- ============================================================
-- Kurban Hisse Takip - Veritabanı Şeması
-- Supabase SQL Editor'a yapıştırarak çalıştırın
-- ============================================================

-- Hayvanlar tablosu
CREATE TABLE IF NOT EXISTS animals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('koyun', 'keci', 'dana', 'deve')),
  weight_kg DECIMAL(6,2),
  total_shares INTEGER NOT NULL DEFAULT 1,
  available_shares INTEGER NOT NULL DEFAULT 1,
  price_per_share DECIMAL(10,2) NOT NULL,
  description TEXT,
  image_url TEXT,
  slaughter_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Müşteriler tablosu
CREATE TABLE IF NOT EXISTS customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,
  tc_no TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Siparişler tablosu
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tracking_code TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  animal_id UUID REFERENCES animals(id) ON DELETE SET NULL,
  share_count INTEGER NOT NULL DEFAULT 1,
  order_type TEXT NOT NULL CHECK (order_type IN ('hisse', 'tam_hayvan')),
  total_price DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'beklemede'
    CHECK (status IN ('beklemede','onaylandi','kesim_basladi','kesildi','teslim_edildi','iptal')),
  appointment_datetime TIMESTAMPTZ,
  slaughter_started_at TIMESTAMPTZ,
  slaughter_completed_at TIMESTAMPTZ,
  delivery_type TEXT NOT NULL DEFAULT 'paket_et'
    CHECK (delivery_type IN ('yerinde_kesim','paket_et','uzerime_birak')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Kesim günlüğü tablosu
CREATE TABLE IF NOT EXISTS slaughter_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Örnek veriler
-- ============================================================

INSERT INTO animals (name, type, weight_kg, total_shares, available_shares, price_per_share, description, slaughter_date)
VALUES
  ('Büyük Dana 1', 'dana', 380, 7, 7, 8500, 'Sağlıklı, besili Simental dana. Toplam 7 hisse.', '2025-06-06'),
  ('Büyük Dana 2', 'dana', 420, 7, 5, 9000, 'İri yapılı, semiz Montofon dana.', '2025-06-06'),
  ('Orta Dana', 'dana', 310, 7, 3, 7500, '2 yaşında, orta boy dana.', '2025-06-07'),
  ('Koyun 1', 'koyun', 55, 1, 1, 12000, 'Akkaraman cinsi, 2 yaşında.', '2025-06-06'),
  ('Koyun 2', 'koyun', 48, 1, 1, 10500, 'Merinos cinsi, bakımlı.', '2025-06-07'),
  ('Koyun 3', 'koyun', 62, 1, 1, 13500, 'İri yapılı Akkaraman.', '2025-06-06'),
  ('Keçi 1', 'keci', 40, 1, 1, 9000, 'Kıl keçisi, 2 yaşında.', '2025-06-07'),
  ('Deve (Hisse)', 'deve', 650, 7, 7, 18000, 'Türk devesi, 5 yaşında olgun. 7 hisse.', '2025-06-08');

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

ALTER TABLE animals ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE slaughter_logs ENABLE ROW LEVEL SECURITY;

-- Hayvanları herkes görebilir
CREATE POLICY "animals_public_read" ON animals
  FOR SELECT USING (is_active = true);

-- Admin tüm işlemleri yapabilir
CREATE POLICY "animals_admin_all" ON animals
  FOR ALL USING (auth.role() = 'authenticated');

-- Müşteri kaydı herkese açık
CREATE POLICY "customers_public_insert" ON customers
  FOR INSERT WITH CHECK (true);

-- Kendi kaydını okuyabilir (tracking için)
CREATE POLICY "customers_admin_read" ON customers
  FOR SELECT USING (auth.role() = 'authenticated');

-- Sipariş oluşturma herkese açık
CREATE POLICY "orders_public_insert" ON orders
  FOR INSERT WITH CHECK (true);

-- Takip kodu ile sipariş okuma (herkese açık)
CREATE POLICY "orders_public_read_by_tracking" ON orders
  FOR SELECT USING (true);

-- Admin tüm sipariş işlemleri
CREATE POLICY "orders_admin_all" ON orders
  FOR ALL USING (auth.role() = 'authenticated');

-- Kesim logu admin görür
CREATE POLICY "logs_admin_all" ON slaughter_logs
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "logs_public_read" ON slaughter_logs
  FOR SELECT USING (true);
