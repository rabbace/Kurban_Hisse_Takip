-- ============================================================
-- Güncelleme 1: Siparişlere fotoğraf URL kolonu ekle
-- ============================================================
ALTER TABLE orders ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- ============================================================
-- Güncelleme 2: Supabase Storage — order-photos bucket
-- Supabase Dashboard > Storage > New Bucket: "order-photos" (Public: ON)
-- Ardından aşağıdaki policy'leri SQL Editor'da çalıştırın:
-- ============================================================

-- Herkes fotoğrafları görebilir
CREATE POLICY "order_photos_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'order-photos');

-- Sadece giriş yapmış admin yükleyebilir
CREATE POLICY "order_photos_admin_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'order-photos'
    AND auth.role() = 'authenticated'
  );

-- Admin silebilir / güncelleyebilir
CREATE POLICY "order_photos_admin_update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'order-photos' AND auth.role() = 'authenticated');
