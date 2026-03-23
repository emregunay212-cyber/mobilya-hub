# Mobilya Hub — Multi-Tenant E-Ticaret

Tek Supabase projesi ile sınırsız mobilya mağazası çalıştıran Next.js e-ticaret platformu.

## Stack
- **Frontend:** Next.js 15 + Tailwind CSS v4
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **Deploy:** Vercel
- **Maliyet:** $0/ay (Free plan) veya $25/ay (Pro plan, sınırsız mağaza)

## Kurulum

```bash
npm install
cp .env.local.example .env.local  # Supabase bilgilerini düzenle
npm run dev
```

## Multi-Tenant Yapı

Her mağaza `stores` tablosunda bir kayıt. URL yapısı:
- `/kurtdereli` → Kurtdereli Mobilya mağazası
- `/inegol-mobilya` → İnegöl Mobilya mağazası
- `/kurtdereli/urun/doga-kose-koltuk` → Ürün detay

Yeni müşteri eklemek için sadece `stores` tablosuna kayıt ekle + ürünlerini gir.

## Vercel'e Deploy

```bash
vercel --prod
```

Environment variables'ları Vercel dashboard'dan ekle:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
