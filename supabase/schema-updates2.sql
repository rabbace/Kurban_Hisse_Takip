-- Hayvanın bulunduğu ahır/alan bilgisi
ALTER TABLE animals ADD COLUMN IF NOT EXISTS location TEXT;

-- Ödeme tercihi ve o ana kadar alınan ödeme tutarı
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_type TEXT NOT NULL DEFAULT 'sonra'
  CHECK (payment_type IN ('pesin','kismi','sonra'));
ALTER TABLE orders ADD COLUMN IF NOT EXISTS paid_amount DECIMAL(10,2) NOT NULL DEFAULT 0;
