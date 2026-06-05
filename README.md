# Kurban Hisse Takip Sistemi

Kurbanlık hayvan ve hisse satışı, randevu ve kesim takibi için web uygulaması.

## Özellikler

**Müşteri Tarafı**
- Mevcut hayvan ve hisseleri listeleme (tür ve arama filtresi)
- Hisse veya tam hayvan satın alma formu
- Teslimat tercihi (yerinde kesim / paket et / üzerime bırak)
- Randevu tarih/saat seçimi
- Anlık takip kodu ile kesim durumu sorgulama

**Admin Paneli**
- Dashboard: sipariş istatistikleri, bugünkü randevular
- Hayvan yönetimi: ekle / düzenle / pasife al
- Sipariş listesi: durum filtreleme, müşteri arama, durum güncelleme + log
- Kesim takvimi: güne göre randevu görünümü

## Teknoloji Yığını

- **Frontend:** Next.js 15, TypeScript, Tailwind CSS
- **Backend/DB:** Supabase (PostgreSQL + Auth + Realtime)
- **Deploy:** Vercel (önerilen)

## Kurulum

### 1. Supabase Projesi

1. [supabase.com](https://supabase.com) adresinden ücretsiz proje oluşturun
2. SQL Editor'dan `supabase/schema.sql` dosyasını çalıştırın
3. Authentication > Users bölümünden admin kullanıcısı oluşturun

### 2. Ortam Değişkenleri

```bash
cp .env.local.example .env.local
```

`.env.local` dosyasını Supabase proje bilgilerinizle doldurun:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

Bu bilgiler Supabase → Project Settings → API bölümünde yer alır.

### 3. Geliştirme Ortamı

```bash
npm install
npm run dev
```

Uygulama `http://localhost:3000` adresinde çalışır.

### 4. Vercel'e Deploy

```bash
npx vercel
```

Vercel dashboard'da environment variables olarak Supabase bilgilerini ekleyin.

## Sayfa Yapısı

| URL | Açıklama |
|-----|----------|
| `/` | Ana sayfa — hayvan/hisse listesi |
| `/siparis?animal_id=...` | Sipariş formu |
| `/takip` | Takip kodu giriş sayfası |
| `/takip/[kod]` | Kesim durumu takip detayı |
| `/admin/giris` | Admin girişi |
| `/admin` | Dashboard |
| `/admin/siparisler` | Sipariş yönetimi |
| `/admin/hayvanlar` | Hayvan yönetimi |
| `/admin/kesim` | Kesim takvimi |

## Veritabanı Şeması

| Tablo | Açıklama |
|-------|----------|
| `animals` | Kurbanlık hayvanlar ve hisse bilgileri |
| `customers` | Müşteri kayıtları |
| `orders` | Siparişler (takip kodu, durum, randevu) |
| `slaughter_logs` | Durum değişikliği geçmişi |
