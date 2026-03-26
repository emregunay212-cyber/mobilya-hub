import { supabase } from "@/lib/supabase";
import Link from "next/link";

export const revalidate = 60;

const SECTOR_ICONS = {
  mobilyaci: "🛋️", kuyumcu: "💎", cafe: "☕", "oto-galeri": "🚗",
  tanitim: "🏢", restoran: "🍽️", portfolyo: "🎨", kuafor: "💇",
};

const SECTOR_NAMES = {
  mobilyaci: "Mobilya", kuyumcu: "Kuyumcu", cafe: "Kafe",
  "oto-galeri": "Oto Galeri", tanitim: "Kurumsal", restoran: "Restoran",
  portfolyo: "Portfolyo", kuafor: "Kuaför",
};

export default async function HomePage() {
  const { data: stores } = await supabase
    .from("stores")
    .select("*")
    .eq("is_active", true);

  const storeCount = stores?.length || 0;

  return (
    <main className="min-h-screen" style={{ background: "#FAFAF8" }}>
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-md" style={{ background: "rgba(250,250,248,0.9)", borderBottom: "1px solid #E8DDD0" }}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-xl font-black tracking-tight" style={{ color: "#2C2420" }}>
            Web<span style={{ color: "#C8553D" }}>Koda</span>
          </span>
          <div className="flex items-center gap-6">
            <a href="#ozellikler" className="text-sm font-medium hidden sm:block" style={{ color: "#6B5B4E" }}>Özellikler</a>
            <a href="#portfolyo" className="text-sm font-medium hidden sm:block" style={{ color: "#6B5B4E" }}>Portfolyo</a>
            <a href="#fiyat" className="text-sm font-medium hidden sm:block" style={{ color: "#6B5B4E" }}>Fiyatlar</a>
            <a
              href="https://wa.me/905459318516"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-full text-sm font-bold text-white"
              style={{ background: "#C8553D" }}
            >
              İletişim
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-6" style={{ background: "#C8553D15", color: "#C8553D" }}>
            ✦ {storeCount}+ İşletme Bize Güveniyor
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.1] mb-6" style={{ color: "#2C2420" }}>
            İşletmenizin Web Sitesi<br />
            <span style={{ color: "#C8553D" }}>24 Saatte Hazır</span>
          </h1>
          <p className="text-lg max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: "#6B5B4E" }}>
            Mobilyacı, kuyumcu, kafe, restoran, kuaför, oto galeri...
            Sektörünüze özel profesyonel web sitesi. Kod bilgisi gerekmez.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://wa.me/905459318516?text=Merhaba%2C%20web%20sitesi%20yaptirmak%20istiyorum"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 rounded-full text-sm font-bold text-white inline-flex items-center gap-2"
              style={{ background: "#25D366" }}
            >
              💬 WhatsApp ile Ulaşın
            </a>
            <a href="#portfolyo" className="px-8 py-4 rounded-full text-sm font-bold border-2 inline-flex items-center gap-2" style={{ borderColor: "#2C2420", color: "#2C2420" }}>
              Örnekleri Gör →
            </a>
          </div>
        </div>
      </section>

      {/* Sectors */}
      <section className="py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-wrap justify-center gap-3">
            {Object.entries(SECTOR_ICONS).map(([key, icon]) => (
              <div
                key={key}
                className="flex items-center gap-2 px-5 py-3 rounded-full text-sm font-semibold"
                style={{ background: "#fff", border: "1px solid #E8DDD0", color: "#2C2420" }}
              >
                <span className="text-lg">{icon}</span>
                {SECTOR_NAMES[key]}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="ozellikler" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-bold tracking-[0.3em] uppercase text-center mb-2" style={{ color: "#C8553D" }}>
            ÖZELLİKLER
          </p>
          <h2 className="text-3xl font-black text-center mb-12" style={{ color: "#2C2420" }}>
            Neden WebKoda?
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              ["⚡", "Hızlı Kurulum", "24 saat içinde siteniz hazır. Beklemek yok, hemen yayında."],
              ["🎨", "18+ Profesyonel Tema", "Sektörünüze özel tasarlanmış, mobil uyumlu temalar."],
              ["📱", "Mobil Uyumlu", "Tüm cihazlarda mükemmel görünen responsive tasarım."],
              ["💬", "WhatsApp Entegrasyonu", "Müşterileriniz tek tıkla size ulaşsın."],
              ["🔍", "SEO Optimizasyonu", "Google'da üst sıralarda yer alın."],
              ["🛡️", "Güvenli & Hızlı", "SSL sertifikası, CDN, %99.9 uptime garantisi."],
            ].map(([icon, title, desc]) => (
              <div
                key={title}
                className="p-6 rounded-2xl"
                style={{ background: "#fff", border: "1px solid #E8DDD0" }}
              >
                <div className="text-3xl mb-3">{icon}</div>
                <h3 className="font-bold mb-2" style={{ color: "#2C2420" }}>{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#6B5B4E" }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio */}
      <section id="portfolyo" className="py-20 px-6" style={{ background: "#2C2420" }}>
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-bold tracking-[0.3em] uppercase text-center mb-2" style={{ color: "#C8553D" }}>
            PORTFOLYO
          </p>
          <h2 className="text-3xl font-black text-center mb-12 text-white">
            Yaptığımız Siteler
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores?.map((store) => {
              const sector = store.settings?.sector || "mobilyaci";
              return (
                <Link
                  key={store.id}
                  href={`/${store.slug}`}
                  className="block rounded-2xl overflow-hidden transition-transform hover:scale-[1.02]"
                  style={{ background: "#3A3530" }}
                >
                  <div className="aspect-video flex items-center justify-center text-5xl" style={{ background: "#4A4540" }}>
                    {SECTOR_ICONS[sector] || "🏪"}
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "#C8553D20", color: "#C8553D" }}>
                        {SECTOR_NAMES[sector] || sector}
                      </span>
                    </div>
                    <h3 className="font-bold text-white mb-1">{store.name}</h3>
                    <p className="text-xs" style={{ color: "#9CA3AF" }}>
                      📍 {store.city}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="fiyat" className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-bold tracking-[0.3em] uppercase text-center mb-2" style={{ color: "#C8553D" }}>
            FİYATLAR
          </p>
          <h2 className="text-3xl font-black text-center mb-12" style={{ color: "#2C2420" }}>
            İşletmenize Uygun Paket Seçin
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {/* Starter */}
            <div className="rounded-2xl p-6" style={{ background: "#fff", border: "1px solid #E8DDD0" }}>
              <p className="text-xs font-bold uppercase mb-1" style={{ color: "#6B5B4E" }}>Başlangıç</p>
              <p className="text-3xl font-black mb-1" style={{ color: "#2C2420" }}>₺750<span className="text-sm font-normal" style={{ color: "#6B5B4E" }}>/ay</span></p>
              <p className="text-xs mb-6" style={{ color: "#9CA3AF" }}>+ ₺2.000 kurulum</p>
              <ul className="space-y-2 text-sm mb-6" style={{ color: "#6B5B4E" }}>
                {["Hazır tema", "50 ürüne kadar", "Subdomain (xxx.webkoda.dev)", "WhatsApp entegrasyonu", "Temel SEO"].map((f) => (
                  <li key={f} className="flex items-center gap-2"><span style={{ color: "#10B981" }}>✓</span>{f}</li>
                ))}
              </ul>
            </div>
            {/* Pro */}
            <div className="rounded-2xl p-6 relative" style={{ background: "#2C2420", border: "2px solid #C8553D" }}>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold text-white" style={{ background: "#C8553D" }}>
                POPÜLER
              </div>
              <p className="text-xs font-bold uppercase mb-1" style={{ color: "#C8553D" }}>Profesyonel</p>
              <p className="text-3xl font-black mb-1 text-white">₺1.250<span className="text-sm font-normal" style={{ color: "#9CA3AF" }}>/ay</span></p>
              <p className="text-xs mb-6" style={{ color: "#9CA3AF" }}>+ ₺3.000 kurulum</p>
              <ul className="space-y-2 text-sm mb-6 text-white/80">
                {["Özel domain (.com)", "Sınırsız ürün", "Premium tema seçimi", "Google Analytics", "Öncelikli destek", "Aylık SEO raporu"].map((f) => (
                  <li key={f} className="flex items-center gap-2"><span style={{ color: "#10B981" }}>✓</span>{f}</li>
                ))}
              </ul>
            </div>
            {/* Enterprise */}
            <div className="rounded-2xl p-6" style={{ background: "#fff", border: "1px solid #E8DDD0" }}>
              <p className="text-xs font-bold uppercase mb-1" style={{ color: "#6B5B4E" }}>Kurumsal</p>
              <p className="text-3xl font-black mb-1" style={{ color: "#2C2420" }}>₺2.500<span className="text-sm font-normal" style={{ color: "#6B5B4E" }}>/ay</span></p>
              <p className="text-xs mb-6" style={{ color: "#9CA3AF" }}>+ ₺5.000 kurulum</p>
              <ul className="space-y-2 text-sm mb-6" style={{ color: "#6B5B4E" }}>
                {["Özel tasarım", "Ödeme entegrasyonu", "Yönetim paneli", "Google Ads yönetimi", "7/24 öncelikli destek", "Aylık bakım & güncelleme"].map((f) => (
                  <li key={f} className="flex items-center gap-2"><span style={{ color: "#10B981" }}>✓</span>{f}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center" style={{ background: "#C8553D" }}>
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-black text-white mb-4">
            İşletmenizi Online'a Taşıyalım
          </h2>
          <p className="text-white/80 mb-8">
            Hemen WhatsApp'tan yazın, 24 saat içinde siteniz hazır olsun.
          </p>
          <a
            href="https://wa.me/905459318516?text=Merhaba%2C%20web%20sitesi%20yaptirmak%20istiyorum"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-sm font-bold"
            style={{ background: "#fff", color: "#2C2420" }}
          >
            💬 Ücretsiz Teklif Alın
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6" style={{ background: "#2C2420" }}>
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm font-bold text-white">
            Web<span style={{ color: "#C8553D" }}>Koda</span>
          </span>
          <p className="text-xs" style={{ color: "#9CA3AF" }}>
            © 2025 WebKoda. Tüm hakları saklıdır.
          </p>
          <div className="flex gap-4">
            <a href="https://wa.me/905459318516" className="text-xs" style={{ color: "#9CA3AF" }}>WhatsApp</a>
            <a href="https://instagram.com/webkoda" className="text-xs" style={{ color: "#9CA3AF" }}>Instagram</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
