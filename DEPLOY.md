# Hızlı Deploy Rehberi

## Claude Code ile (EN HIZLI):
```bash
cd mobilya-hub
npm install
npx vercel --prod
```
Vercel sana sorduğunda:
- Set up and deploy? → Y
- Which scope? → emre's projects
- Link to existing project? → N
- Project name? → mobilya-hub
- Directory? → ./
- Override settings? → N

Sonra Environment Variables ekle:
```bash
npx vercel env add NEXT_PUBLIC_SUPABASE_URL production
# yapıştır: https://xoqwwlkglnzrnjrcpryz.supabase.co

npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production  
# yapıştır: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhvcXd3bGtnbG56cm5qcmNwcnl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyNTYzMTIsImV4cCI6MjA4OTgzMjMxMn0.oK9E-WZMonEcQLsh4aLmYe9oXNbqNQstu7buS3AO9Rc

npx vercel env add SUPABASE_SERVICE_ROLE_KEY production
# yapıştır: (Supabase Dashboard > Settings > API > service_role key)
```

Son deploy:
```bash
npx vercel --prod
```

## Siteler:
- mobilya-hub.vercel.app/ → Ana sayfa
- mobilya-hub.vercel.app/kurtdereli → Kurtdereli Mobilya
- mobilya-hub.vercel.app/inegol-mobilya → İnegöl Mobilya
- mobilya-hub.vercel.app/admin → Admin Paneli
