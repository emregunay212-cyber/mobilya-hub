# Deploy Rehberi

## 1. Environment Variables
`.env.example` dosyasini `.env.local` olarak kopyalayin ve gercek degerleri girin:
```bash
cp .env.example .env.local
```

## 2. Kurulum
```bash
npm install
npm run dev
```

## 3. Vercel Deploy
```bash
npx vercel --prod
```

Vercel'de Environment Variables'i ayarlayin:
- Supabase Dashboard > Settings > API'den keyleri alin
- `.env.example` dosyasindaki tum degiskenleri Vercel'e ekleyin

## 4. Supabase Setup
- Supabase Dashboard'dan yeni tablo migration'larini calistirin
- RLS policyleri aktif ettiginizden emin olun

## Siteler
- `/` - Platform ana sayfa
- `/admin` - Admin paneli
- `/[store-slug]` - Magaza sayfalari
