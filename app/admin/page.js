"use client";
import { useState, useEffect, useCallback } from "react";
import { THEMES, getThemeById } from "@/lib/themes";

function slugify(t) {
  return t.toLowerCase().replace(/ğ/g,"g").replace(/ü/g,"u").replace(/ş/g,"s").replace(/ı/g,"i").replace(/ö/g,"o").replace(/ç/g,"c").replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"");
}

const CAT_PRESETS = {
  mobilya: ["Koltuk Takımları","Yatak Odası","Yemek Odası","TV Ünitesi","Genç Odası","Mutfak"],
  dugun: ["Düğün Paketi","Yatak Odası","Koltuk Takımları","Yemek Odası","Halı & Perde","Avize"],
  dekorasyon: ["Halı","Perde","Aydınlatma","Ev Tekstili","Dekoratif Obje","Duvar Sanatı"],
};

const STEPS = ["Tasarım","Bilgiler","Kategoriler","Oluştur"];
const S = { bg:"#0F1117", card:"#1A1D27", bdr:"#2A2D37", pri:"#6366F1", grn:"#10B981", red:"#EF4444", org:"#F59E0B", txt:"#E5E7EB", mut:"#9CA3AF", dim:"#4B5563" };

// ─── AUTH GATE ───
function useAdminAuth() {
  const [token, setToken] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const saved = sessionStorage.getItem("admin_token");
    if (saved) setToken(saved);
    setChecking(false);
  }, []);

  const login = (t) => {
    sessionStorage.setItem("admin_token", t);
    setToken(t);
  };

  const logout = () => {
    sessionStorage.removeItem("admin_token");
    setToken(null);
  };

  const apiFetch = useCallback(async (url, options = {}) => {
    return fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });
  }, [token]);

  return { token, checking, login, logout, apiFetch };
}

// ─── LOGIN SCREEN ───
function LoginScreen({ onLogin }) {
  const [secret, setSecret] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/stores", {
        headers: { Authorization: `Bearer ${secret}` },
      });
      if (res.ok) {
        onLogin(secret);
      } else {
        setError("Geçersiz admin anahtarı");
      }
    } catch {
      setError("Bağlantı hatası");
    }
    setLoading(false);
  };

  return (
    <Shell>
      <div style={{ maxWidth: 400, margin: "0 auto", padding: "80px 20px", textAlign: "center" }}>
        <div style={{ width: 56, height: 56, borderRadius: 14, background: S.pri, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 24 }}>🔒</div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#fff", marginBottom: 6 }}>Admin Girişi</h1>
        <p style={{ color: S.mut, fontSize: 13, marginBottom: 24 }}>Devam etmek için admin anahtarını girin.</p>
        <input
          className="ip"
          type="password"
          placeholder="ADMIN_SECRET"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
        />
        {error && <p style={{ color: S.red, fontSize: 12, marginTop: 8 }}>{error}</p>}
        <Btn onClick={handleLogin} bg={S.pri} style={{ width: "100%", marginTop: 12 }} disabled={loading || !secret}>
          {loading ? "Kontrol ediliyor..." : "Giriş Yap"}
        </Btn>
      </div>
    </Shell>
  );
}

// ─── MAIN ADMIN PAGE ───
export default function AdminPage() {
  const { token, checking, login, logout, apiFetch } = useAdminAuth();
  const [view, setView] = useState("list"); // list | wizard | done | products | editStore
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  // Wizard state
  const [step, setStep] = useState(0);
  const [theme, setTheme] = useState(null);
  const [f, setF] = useState({ name: "", phone: "", whatsapp: "", email: "", address: "", city: "Balıkesir", description: "", instagram: "" });
  const [preset, setPreset] = useState("mobilya");
  const [cats, setCats] = useState([...CAT_PRESETS.mobilya]);
  const [newCat, setNewCat] = useState("");
  const [creating, setCreating] = useState(false);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  // Product management state
  const [selectedStore, setSelectedStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [prodLoading, setProdLoading] = useState(false);
  const [prodForm, setProdForm] = useState(null); // null = list, object = form
  const [prodSaving, setProdSaving] = useState(false);
  const [categories, setCategories] = useState([]);

  // Edit store state
  const [editStore, setEditStore] = useState(null);
  const [editSaving, setEditSaving] = useState(false);

  const sl = slugify(f.name || "magaza");
  const th = theme ? getThemeById(theme) : null;
  const canNext = step === 0 ? !!theme : step === 1 ? f.name.trim() && f.phone.trim() : step === 2 ? cats.length > 0 : true;

  const log = (m) => setLogs((p) => [...p, { t: new Date().toLocaleTimeString("tr-TR"), m }]);
  const doPreset = (k) => { setPreset(k); if (CAT_PRESETS[k]) setCats([...CAT_PRESETS[k]]); };
  const addCat = () => { if (newCat.trim() && !cats.includes(newCat.trim())) { setCats([...cats, newCat.trim()]); setNewCat(""); } };
  const rmCat = (i) => setCats(cats.filter((_, idx) => idx !== i));

  // ─── DATA LOADING ───
  const loadStores = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await apiFetch("/api/admin/stores");
      const data = await res.json();
      setStores(Array.isArray(data) ? data : []);
    } catch { setStores([]); }
    setLoading(false);
  }, [token, apiFetch]);

  useEffect(() => { if (token) loadStores(); }, [token, loadStores]);

  const loadProducts = async (store) => {
    setSelectedStore(store);
    setProdLoading(true);
    setProdForm(null);
    setView("products");
    try {
      const [prodRes, catRes] = await Promise.all([
        apiFetch(`/api/admin/products?store_id=${store.id}`),
        apiFetch(`/api/admin/stores`), // categories come with store
      ]);
      const prodData = await prodRes.json();
      setProducts(Array.isArray(prodData) ? prodData : []);
      // Load categories from supabase directly
      const storeData = await catRes.json();
      const s = Array.isArray(storeData) ? storeData.find((st) => st.id === store.id) : null;
      // We'll fetch categories separately
    } catch { setProducts([]); }
    // Load categories
    try {
      const res = await fetch(`/${store.slug}`, { method: "HEAD" }); // just to avoid extra endpoint
    } catch {}
    setProdLoading(false);
  };

  // ─── STORE CRUD ───
  const createStore = async () => {
    setCreating(true); setError(null); setLogs([]);
    try {
      log("Mağaza oluşturuluyor...");
      const res = await apiFetch("/api/admin/stores", {
        method: "POST",
        body: JSON.stringify({
          name: f.name, slug: sl, phone: f.phone, whatsapp: f.whatsapp,
          email: f.email, address: f.address, city: f.city,
          description: f.description, instagram: f.instagram, theme,
          categories: cats.map((c, i) => ({ name: c, slug: slugify(c), sort_order: i + 1 })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Hata oluştu");
      log(`✓ Mağaza oluşturuldu: ${data.store.id.slice(0, 8)}...`);
      log(`✓ ${cats.length} kategori eklendi`);
      log("✓ Tamamlandı!");
      setResult(data.store);
      setView("done");
      loadStores();
    } catch (e) {
      setError(e.message);
      log(`✗ Hata: ${e.message}`);
    }
    setCreating(false);
  };

  const deleteStore = async (storeId) => {
    if (!confirm("Bu mağazayı ve tüm ürünlerini silmek istediğinize emin misiniz?")) return;
    try {
      const res = await apiFetch(`/api/admin/stores/${storeId}`, { method: "DELETE" });
      if (res.ok) loadStores();
    } catch {}
  };

  const updateStore = async () => {
    if (!editStore) return;
    setEditSaving(true);
    try {
      const res = await apiFetch(`/api/admin/stores/${editStore.id}`, {
        method: "PUT",
        body: JSON.stringify(editStore),
      });
      if (res.ok) {
        loadStores();
        setView("list");
        setEditStore(null);
      }
    } catch {}
    setEditSaving(false);
  };

  // ─── PRODUCT CRUD ───
  const saveProduct = async () => {
    if (!prodForm || !selectedStore) return;
    setProdSaving(true);
    try {
      const isEdit = !!prodForm.id;
      const payload = {
        ...prodForm,
        store_id: selectedStore.id,
        slug: prodForm.slug || slugify(prodForm.name || "urun"),
        price: Number(prodForm.price) || 0,
        old_price: prodForm.old_price ? Number(prodForm.old_price) : null,
        stock_count: Number(prodForm.stock_count) || 0,
        images: prodForm.imageUrl ? [prodForm.imageUrl] : (prodForm.images || []),
      };
      delete payload.imageUrl;
      delete payload.categories;

      const res = await apiFetch("/api/admin/products", {
        method: isEdit ? "PUT" : "POST",
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setProdForm(null);
        loadProducts(selectedStore);
      } else {
        const data = await res.json();
        alert(data.error || "Hata oluştu");
      }
    } catch (e) { alert(e.message); }
    setProdSaving(false);
  };

  const deleteProduct = async (id) => {
    if (!confirm("Bu ürünü silmek istediğinize emin misiniz?")) return;
    try {
      const res = await apiFetch(`/api/admin/products?id=${id}`, { method: "DELETE" });
      if (res.ok) loadProducts(selectedStore);
    } catch {}
  };

  const reset = () => {
    setView("wizard"); setStep(0); setTheme(null); setError(null); setLogs([]); setResult(null);
    setF({ name: "", phone: "", whatsapp: "", email: "", address: "", city: "Balıkesir", description: "", instagram: "" });
    setCats([...CAT_PRESETS.mobilya]); setPreset("mobilya");
  };

  // ─── AUTH CHECK ───
  if (checking) return <Shell><p style={{ textAlign: "center", padding: 60, color: S.mut }}>Yükleniyor...</p></Shell>;
  if (!token) return <LoginScreen onLogin={login} />;

  // ─── EDIT STORE VIEW ───
  if (view === "editStore" && editStore) {
    return (
      <Shell onLogout={logout}>
        <div style={{ maxWidth: 600, margin: "0 auto", padding: "24px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <Btn onClick={() => { setView("list"); setEditStore(null); }} bg="transparent" border={S.bdr} color={S.txt}>← Geri</Btn>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>Mağaza Düzenle</h1>
          </div>
          <div style={{ display: "grid", gap: 12 }}>
            <Field label="Mağaza Adı" value={editStore.name || ""} onChange={(v) => setEditStore({ ...editStore, name: v })} S={S} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Field label="Telefon" value={editStore.phone || ""} onChange={(v) => setEditStore({ ...editStore, phone: v })} S={S} />
              <Field label="WhatsApp" value={editStore.whatsapp || ""} onChange={(v) => setEditStore({ ...editStore, whatsapp: v })} S={S} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Field label="E-posta" value={editStore.email || ""} onChange={(v) => setEditStore({ ...editStore, email: v })} S={S} />
              <Field label="Instagram" value={editStore.instagram || ""} onChange={(v) => setEditStore({ ...editStore, instagram: v })} S={S} />
            </div>
            <Field label="Adres" value={editStore.address || ""} onChange={(v) => setEditStore({ ...editStore, address: v })} S={S} />
            <Field label="Şehir" value={editStore.city || ""} onChange={(v) => setEditStore({ ...editStore, city: v })} S={S} />
            <Field label="Açıklama" value={editStore.description || ""} onChange={(v) => setEditStore({ ...editStore, description: v })} textarea S={S} />
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "#D1D5DB", marginBottom: 3, display: "block" }}>Özel Domain</label>
              <Field label="" value={editStore.custom_domain || ""} onChange={(v) => setEditStore({ ...editStore, custom_domain: v })} placeholder="ornek: kurtderelimobilya.com" S={S} />
              <p style={{ fontSize: 10, color: "#818CF8", marginTop: 3 }}>
                Domain&apos;i Vercel&apos;de de eklemeyi unutmayın. DNS: A kaydı → 76.76.21.21
              </p>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "#D1D5DB", marginBottom: 3, display: "block" }}>Durum</label>
              <div style={{ display: "flex", gap: 8 }}>
                <Btn onClick={() => setEditStore({ ...editStore, is_active: true })} bg={editStore.is_active ? S.grn : S.card} border={S.bdr}>Aktif</Btn>
                <Btn onClick={() => setEditStore({ ...editStore, is_active: false })} bg={!editStore.is_active ? S.red : S.card} border={S.bdr}>Pasif</Btn>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
            <Btn onClick={updateStore} bg={S.pri} disabled={editSaving}>{editSaving ? "Kaydediliyor..." : "Kaydet"}</Btn>
          </div>
        </div>
      </Shell>
    );
  }

  // ─── PRODUCT MANAGEMENT VIEW ───
  if (view === "products" && selectedStore) {
    // Product Form
    if (prodForm) {
      return (
        <Shell onLogout={logout}>
          <div style={{ maxWidth: 600, margin: "0 auto", padding: "24px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
              <Btn onClick={() => setProdForm(null)} bg="transparent" border={S.bdr} color={S.txt}>← Geri</Btn>
              <h1 style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>{prodForm.id ? "Ürün Düzenle" : "Yeni Ürün"}</h1>
            </div>
            <div style={{ display: "grid", gap: 12 }}>
              <Field label="Ürün Adı *" value={prodForm.name || ""} onChange={(v) => setProdForm({ ...prodForm, name: v, slug: slugify(v) })} S={S} />
              <Field label="URL Slug" value={prodForm.slug || ""} onChange={(v) => setProdForm({ ...prodForm, slug: v })} S={S} />
              <Field label="Açıklama" value={prodForm.description || ""} onChange={(v) => setProdForm({ ...prodForm, description: v })} textarea S={S} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <Field label="Fiyat (₺) *" value={prodForm.price || ""} onChange={(v) => setProdForm({ ...prodForm, price: v })} placeholder="0" S={S} />
                <Field label="Eski Fiyat (₺)" value={prodForm.old_price || ""} onChange={(v) => setProdForm({ ...prodForm, old_price: v })} placeholder="İndirimli ise" S={S} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <Field label="Stok Adedi" value={prodForm.stock_count || ""} onChange={(v) => setProdForm({ ...prodForm, stock_count: v })} placeholder="0" S={S} />
                <Field label="Badge" value={prodForm.badge || ""} onChange={(v) => setProdForm({ ...prodForm, badge: v })} placeholder="Yeni, Çok Satan..." S={S} />
              </div>
              <Field label="Görsel URL" value={prodForm.imageUrl || (prodForm.images?.[0]) || ""} onChange={(v) => setProdForm({ ...prodForm, imageUrl: v })} placeholder="https://...jpg" S={S} />
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#D1D5DB", marginBottom: 3, display: "block" }}>Stok Durumu</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <Btn onClick={() => setProdForm({ ...prodForm, in_stock: true })} bg={prodForm.in_stock !== false ? S.grn : S.card} border={S.bdr}>Stokta</Btn>
                  <Btn onClick={() => setProdForm({ ...prodForm, in_stock: false })} bg={prodForm.in_stock === false ? S.red : S.card} border={S.bdr}>Stokta Yok</Btn>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
              <Btn onClick={saveProduct} bg={S.pri} disabled={prodSaving}>{prodSaving ? "Kaydediliyor..." : prodForm.id ? "Güncelle" : "Oluştur"}</Btn>
            </div>
          </div>
        </Shell>
      );
    }

    // Product List
    return (
      <Shell onLogout={logout}>
        <div style={{ maxWidth: 700, margin: "0 auto", padding: "24px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <Btn onClick={() => setView("list")} bg="transparent" border={S.bdr} color={S.txt}>← Geri</Btn>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>{selectedStore.name} — Ürünler</h1>
              <p style={{ fontSize: 12, color: S.mut }}>{products.length} ürün</p>
            </div>
            <Btn onClick={() => setProdForm({ name: "", price: "", in_stock: true, stock_count: 10 })} bg={S.pri}>+ Yeni Ürün</Btn>
          </div>

          {prodLoading ? <p style={{ color: S.mut, textAlign: "center", padding: 40 }}>Yükleniyor...</p> :
            products.length === 0 ? (
              <div style={{ textAlign: "center", padding: 60, color: S.mut }}>
                <p style={{ fontSize: 40, marginBottom: 12 }}>📦</p>
                <p style={{ marginBottom: 16 }}>Henüz ürün yok.</p>
                <Btn onClick={() => setProdForm({ name: "", price: "", in_stock: true, stock_count: 10 })} bg={S.pri}>İlk Ürünü Ekle</Btn>
              </div>
            ) : (
              <div style={{ display: "grid", gap: 8 }}>
                {products.map((p) => (
                  <div key={p.id} style={{ background: S.card, borderRadius: 12, padding: 14, border: `1px solid ${S.bdr}`, display: "flex", alignItems: "center", gap: 12 }}>
                    {/* Thumbnail */}
                    <div style={{ width: 48, height: 48, borderRadius: 8, background: "#2A2D37", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
                      {p.images && p.images.length > 0 ? (
                        <img src={p.images[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <span style={{ fontSize: 20 }}>🛋️</span>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                        <h3 style={{ fontSize: 14, fontWeight: 700, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</h3>
                        {p.badge && <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 4, background: S.org, color: "#fff", fontWeight: 600 }}>{p.badge}</span>}
                      </div>
                      <p style={{ fontSize: 12, color: S.mut }}>
                        {p.categories?.name || "Kategorisiz"} · {new Intl.NumberFormat("tr-TR").format(p.price)} ₺
                        {p.old_price ? ` (eski: ${new Intl.NumberFormat("tr-TR").format(p.old_price)} ₺)` : ""}
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                      <span style={{ fontSize: 10, padding: "3px 8px", borderRadius: 5, background: p.in_stock ? S.grn : S.red, color: "#fff", fontWeight: 600 }}>
                        {p.in_stock ? `${p.stock_count} adet` : "Yok"}
                      </span>
                      <Btn onClick={() => setProdForm({ ...p, imageUrl: p.images?.[0] || "" })} bg={S.card} border={S.bdr} color={S.txt} small>Düzenle</Btn>
                      <Btn onClick={() => deleteProduct(p.id)} bg={S.card} border={S.bdr} color={S.red} small>Sil</Btn>
                    </div>
                  </div>
                ))}
              </div>
            )}
        </div>
      </Shell>
    );
  }

  // ─── DONE VIEW ───
  if (view === "done" && result) {
    return (
      <Shell onLogout={logout}>
        <div style={{ maxWidth: 600, margin: "0 auto", padding: "40px 20px", textAlign: "center" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: S.grn, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 28, color: "#fff" }}>✓</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6, color: "#fff" }}>{f.name} Oluşturuldu!</h1>
          <p style={{ color: S.mut, fontSize: 14, marginBottom: 24 }}>Supabase&apos;e otomatik kaydedildi.</p>
          <Card title="Mağaza Bilgileri">
            {[["Mağaza", f.name], ["URL", "/" + sl], ["Tema", th?.name], ["Kategoriler", cats.join(", ")], ["Store ID", result.id?.slice(0, 16) + "..."]].map(([k, v]) => <Row key={k} k={k} v={v} />)}
          </Card>
          <Card title="İşlem Logu" mt={16}>
            {logs.map((l, i) => <p key={i} style={{ fontSize: 12, color: S.txt, lineHeight: 1.8 }}><span style={{ color: S.dim, marginRight: 8 }}>{l.t}</span>{l.m}</p>)}
          </Card>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 28 }}>
            <Btn onClick={() => { setView("list"); reset(); }} bg={S.card} color="#fff" border={S.bdr}>← Mağaza Listesi</Btn>
            <Btn onClick={reset} bg={S.pri}>+ Yeni Mağaza</Btn>
          </div>
        </div>
      </Shell>
    );
  }

  // ─── LIST VIEW ───
  if (view === "list") {
    return (
      <Shell onLogout={logout}>
        <div style={{ maxWidth: 700, margin: "0 auto", padding: "24px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: "#fff" }}>Mağazalarım</h1>
              <p style={{ fontSize: 13, color: S.mut }}>{stores.length} mağaza kayıtlı</p>
            </div>
            <Btn onClick={() => setView("wizard")} bg={S.pri}>+ Yeni Mağaza</Btn>
          </div>

          {loading ? <p style={{ color: S.mut, textAlign: "center", padding: 40 }}>Yükleniyor...</p> :
            stores.length === 0 ? (
              <div style={{ textAlign: "center", padding: 60, color: S.mut }}>
                <p style={{ fontSize: 40, marginBottom: 12 }}>🏪</p>
                <p style={{ marginBottom: 16 }}>Henüz mağaza yok.</p>
                <Btn onClick={() => setView("wizard")} bg={S.pri}>İlk Mağazayı Oluştur</Btn>
              </div>
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                {stores.map((s) => {
                  const sTheme = s.settings?.theme ? getThemeById(s.settings.theme) : null;
                  return (
                    <div key={s.id} style={{ background: S.card, borderRadius: 14, padding: 16, border: `1px solid ${S.bdr}` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 10, background: sTheme?.palette?.brand || S.pri, display: "flex", alignItems: "center", justifyContent: "center", color: sTheme?.palette?.gold || "#fff", fontWeight: 800, fontSize: 18, flexShrink: 0 }}>
                          {s.name?.[0]}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{s.name}</h3>
                            <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 5, background: s.is_active ? S.grn : S.red, color: "#fff", fontWeight: 600 }}>
                              {s.is_active ? "Aktif" : "Pasif"}
                            </span>
                          </div>
                          <p style={{ fontSize: 12, color: S.mut }}>/{s.slug} · {s.city} · {new Date(s.created_at).toLocaleDateString("tr-TR")}</p>
                          {s.custom_domain && <p style={{ fontSize: 11, color: "#818CF8", marginTop: 2 }}>🌐 {s.custom_domain}</p>}
                        </div>
                        <div style={{ fontSize: 12, color: S.dim, textAlign: "right", flexShrink: 0 }}>
                          <p>{s.categories?.[0]?.count || 0} kategori</p>
                          <p>{s.products?.[0]?.count || 0} ürün</p>
                        </div>
                      </div>
                      {/* Actions */}
                      <div style={{ display: "flex", gap: 6, marginTop: 12, paddingTop: 12, borderTop: `1px solid ${S.bdr}` }}>
                        <Btn onClick={() => loadProducts(s)} bg={S.card} border={S.bdr} color={S.txt} small>📦 Ürünler</Btn>
                        <Btn onClick={() => { setEditStore({ ...s }); setView("editStore"); }} bg={S.card} border={S.bdr} color={S.txt} small>✏️ Düzenle</Btn>
                        <Btn onClick={() => window.open(`/${s.slug}`, "_blank")} bg={S.card} border={S.bdr} color={S.txt} small>🔗 Görüntüle</Btn>
                        <div style={{ flex: 1 }} />
                        <Btn onClick={() => deleteStore(s.id)} bg={S.card} border={S.bdr} color={S.red} small>🗑 Sil</Btn>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
        </div>
      </Shell>
    );
  }

  // ─── WIZARD VIEW ───
  return (
    <Shell onLogout={logout}>
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 20px 40px" }}>
        {/* Progress */}
        <div style={{ padding: "18px 0" }}>
          <div style={{ display: "flex", gap: 4 }}>
            {STEPS.map((s, i) => (
              <div key={i} style={{ flex: 1 }}>
                <div style={{ height: 3, borderRadius: 2, background: i <= step ? S.pri : S.bdr, transition: "background .3s" }} />
                <p style={{ fontSize: 10, marginTop: 5, color: i <= step ? "#A5B4FC" : S.dim, fontWeight: i === step ? 700 : 400 }}>{i + 1}. {s}</p>
              </div>
            ))}
          </div>
        </div>

        {/* STEP 0 - Theme */}
        {step === 0 && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 4 }}>Tasarım Seçin</h2>
            <p style={{ color: S.mut, fontSize: 13, marginBottom: 20 }}>Mağazanın görsel temasını belirleyin.</p>
            <div style={{ display: "grid", gap: 12 }}>
              {THEMES.map((t) => (
                <button key={t.id} onClick={() => setTheme(t.id)} style={{ display: "flex", gap: 14, padding: 14, borderRadius: 14, border: theme === t.id ? `2px solid ${S.pri}` : `2px solid ${S.bdr}`, background: theme === t.id ? "#1A1D40" : S.card, cursor: "pointer", textAlign: "left", alignItems: "center" }}>
                  <div style={{ width: 72, minWidth: 72, height: 50, borderRadius: 8, overflow: "hidden", border: "1px solid #333" }}>
                    <div style={{ background: t.palette.brand, height: 10 }} />
                    <div style={{ background: t.palette.warm, height: 40, padding: 2, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
                      {[0, 1, 2, 3].map((i) => <div key={i} style={{ background: t.palette.border, borderRadius: 1, opacity: 0.4 }} />)}
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                      <span style={{ fontWeight: 700, fontSize: 14, color: "#fff" }}>{t.name}</span>
                      {theme === t.id && <span style={{ fontSize: 9, background: S.pri, color: "#fff", padding: "2px 7px", borderRadius: 5, fontWeight: 700 }}>SEÇİLDİ</span>}
                    </div>
                    <p style={{ fontSize: 11, color: S.mut, marginBottom: 3 }}>{t.desc}</p>
                    <div style={{ display: "flex", gap: 3 }}>{t.colors.map((c, i) => <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c, border: "1px solid #444" }} />)}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 1 - Info */}
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 4 }}>Mağaza Bilgileri</h2>
            <p style={{ color: S.mut, fontSize: 13, marginBottom: 20 }}>* zorunlu alanlar</p>
            <div style={{ display: "grid", gap: 12 }}>
              <Field label="Mağaza Adı *" value={f.name} onChange={(v) => setF({ ...f, name: v })} placeholder="örn: Kurtdereli Mobilya" hint={f.name ? `URL: /${sl}` : null} S={S} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <Field label="Telefon *" value={f.phone} onChange={(v) => setF({ ...f, phone: v })} placeholder="0266 XXX XX XX" S={S} />
                <Field label="WhatsApp" value={f.whatsapp} onChange={(v) => setF({ ...f, whatsapp: v })} placeholder="905XXXXXXXXX" S={S} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <Field label="E-posta" value={f.email} onChange={(v) => setF({ ...f, email: v })} placeholder="info@magaza.com" S={S} />
                <Field label="Instagram" value={f.instagram} onChange={(v) => setF({ ...f, instagram: v })} placeholder="kullaniciadi" S={S} />
              </div>
              <Field label="Adres" value={f.address} onChange={(v) => setF({ ...f, address: v })} placeholder="Milli Kuvvetler Cad. No:42" S={S} />
              <Field label="Şehir" value={f.city} onChange={(v) => setF({ ...f, city: v })} S={S} />
              <Field label="Açıklama" value={f.description} onChange={(v) => setF({ ...f, description: v })} placeholder="Mağaza hakkında..." textarea S={S} />
            </div>
          </div>
        )}

        {/* STEP 2 - Categories */}
        {step === 2 && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 4 }}>Kategoriler</h2>
            <p style={{ color: S.mut, fontSize: 13, marginBottom: 16 }}>Hazır şablondan seçin veya özel ekleyin.</p>
            <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
              {[["mobilya", "🛋️ Mobilya"], ["dugun", "💍 Düğün"], ["dekorasyon", "🏠 Dekorasyon"]].map(([k, l]) => (
                <button key={k} onClick={() => doPreset(k)} style={{ padding: "7px 14px", borderRadius: 10, fontSize: 12, fontWeight: 600, border: preset === k ? `1.5px solid ${S.pri}` : `1.5px solid ${S.bdr}`, background: preset === k ? "#1A1D40" : S.card, color: preset === k ? "#A5B4FC" : S.mut, cursor: "pointer" }}>{l}</button>
              ))}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
              {cats.map((c, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, background: S.card, border: `1px solid ${S.bdr}`, borderRadius: 8, padding: "5px 10px" }}>
                  <span style={{ fontSize: 12, fontWeight: 500, color: "#fff" }}>{c}</span>
                  <button onClick={() => rmCat(i)} style={{ background: "none", border: "none", color: S.red, cursor: "pointer", fontSize: 13, padding: 0 }}>✕</button>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <input className="ip" placeholder="Yeni kategori..." value={newCat} onChange={(e) => setNewCat(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addCat()} style={{ flex: 1 }} />
              <Btn onClick={addCat} bg={S.pri}>Ekle</Btn>
            </div>
          </div>
        )}

        {/* STEP 3 - Preview */}
        {step === 3 && th && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 4 }}>Önizleme & Oluştur</h2>
            <p style={{ color: S.mut, fontSize: 13, marginBottom: 20 }}>&quot;Oluştur&quot; butonuna basın — Supabase&apos;e otomatik kaydedilecek.</p>

            {/* Preview */}
            <div style={{ borderRadius: 14, overflow: "hidden", border: `1px solid ${S.bdr}`, marginBottom: 20 }}>
              <div style={{ background: th.palette.brand, padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <div style={{ width: 24, height: 24, borderRadius: 6, background: th.palette.gold, display: "flex", alignItems: "center", justifyContent: "center", color: th.palette.brand, fontWeight: 800, fontSize: 11 }}>{f.name?.[0] || "M"}</div>
                  <span style={{ color: "#fff", fontWeight: 700, fontSize: 12 }}>{f.name}</span>
                </div>
                <span style={{ fontSize: 14 }}>🛒</span>
              </div>
              <div style={{ background: th.palette.warm, padding: 14 }}>
                <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: 3, color: th.palette.accent, textTransform: "uppercase", marginBottom: 3 }}>✦ {f.city}</p>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: th.palette.text, marginBottom: 6 }}>{f.name}</h3>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 10 }}>
                  {cats.slice(0, 4).map((c) => <span key={c} style={{ padding: "3px 8px", borderRadius: 6, fontSize: 9, border: `1px solid ${th.palette.border}`, color: th.palette.muted, fontWeight: 600 }}>{c}</span>)}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
                  {[0, 1, 2].map((i) => <div key={i} style={{ background: "#fff", borderRadius: 8, border: `1px solid ${th.palette.border}`, overflow: "hidden" }}><div style={{ height: 32, background: th.palette.border, opacity: 0.25, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 14 }}>🛋️</span></div><div style={{ padding: 4 }}><div style={{ height: 4, background: th.palette.border, borderRadius: 2, width: "60%", marginBottom: 2 }} /><div style={{ height: 5, background: th.palette.accent, borderRadius: 2, width: "35%", opacity: 0.6 }} /></div></div>)}
                </div>
              </div>
            </div>

            <Card title="Özet">
              {[["Mağaza", f.name], ["URL", "/" + sl], ["Tema", th.name], ["Telefon", f.phone], ["Şehir", f.city], ["Kategoriler", cats.join(", ")]].map(([k, v]) => <Row key={k} k={k} v={v} />)}
            </Card>

            {creating && (
              <Card title="İşlem Logu" mt={16}>
                {logs.map((l, i) => <p key={i} style={{ fontSize: 12, color: S.txt, lineHeight: 1.8 }}><span style={{ color: S.dim, marginRight: 8 }}>{l.t}</span>{l.m}</p>)}
                <p style={{ color: "#818CF8", fontSize: 12, marginTop: 4 }}><span style={{ display: "inline-block", animation: "spin 1s linear infinite" }}>⟳</span> Devam ediyor...</p>
              </Card>
            )}

            {error && <div style={{ background: "#2D1B1B", borderRadius: 12, padding: 14, border: "1px solid #7F1D1D", marginTop: 16, fontSize: 13, color: "#FCA5A5" }}>{error}</div>}
          </div>
        )}

        {/* NAV */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
          <Btn onClick={() => { if (step === 0) setView("list"); else setStep(step - 1); }} bg="transparent" border={S.bdr} color={step === 0 ? S.dim : S.txt}>
            {step === 0 ? "← Liste" : "← Geri"}
          </Btn>
          {step < 3 ? (
            <Btn onClick={() => canNext && setStep(step + 1)} bg={canNext ? S.pri : S.bdr} color={canNext ? "#fff" : S.dim} disabled={!canNext}>İleri →</Btn>
          ) : (
            <Btn onClick={createStore} bg={creating ? S.dim : S.grn} disabled={creating}>
              {creating ? "Oluşturuluyor..." : "⚡ Otomatik Oluştur"}
            </Btn>
          )}
        </div>
      </div>
    </Shell>
  );
}

// ─── SHARED COMPONENTS ───
function Shell({ children, onLogout }) {
  return (
    <div style={{ fontFamily: "'DM Sans',system-ui,sans-serif", background: S.bg, minHeight: "100vh", color: "#fff" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        .ip{width:100%;padding:11px 14px;border-radius:10px;border:1.5px solid #2A2D37;background:#1A1D27;color:#fff;font-size:14px;outline:none;transition:border-color .2s;font-family:'DM Sans',sans-serif;box-sizing:border-box}
        .ip:focus{border-color:#6366F1}.ip::placeholder{color:#4B5563}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>
      <div style={{ borderBottom: "1px solid #1E2130", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: "#6366F1", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13 }}>W</div>
          <span style={{ fontWeight: 700, fontSize: 14 }}>WEBKODA Admin</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 11, color: "#10B981", fontWeight: 600 }}>● Supabase Bağlı</span>
          {onLogout && (
            <button onClick={onLogout} style={{ fontSize: 11, color: S.dim, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>Çıkış</button>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

function Card({ title, children, mt = 0, color = null }) {
  return (
    <div style={{ background: S.card, borderRadius: 14, padding: 18, border: `1px solid ${S.bdr}`, marginTop: mt }}>
      <h3 style={{ fontSize: 11, fontWeight: 700, color: color || "#818CF8", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10 }}>{title}</h3>
      {children}
    </div>
  );
}

function Row({ k, v }) {
  return (
    <div style={{ display: "flex", gap: 8, fontSize: 13, marginBottom: 4 }}>
      <span style={{ color: S.dim, minWidth: 80 }}>{k}:</span>
      <span style={{ color: S.txt, fontWeight: 500 }}>{v}</span>
    </div>
  );
}

function Btn({ onClick, bg, color = "#fff", border, disabled, children, small, style: extraStyle }) {
  return (
    <button onClick={disabled ? undefined : onClick} disabled={disabled} style={{
      padding: small ? "6px 12px" : "11px 24px",
      borderRadius: small ? 8 : 12,
      background: bg,
      color,
      border: border ? `1.5px solid ${border}` : "none",
      fontSize: small ? 11 : 13,
      fontWeight: 700,
      cursor: disabled ? "default" : "pointer",
      transition: "opacity .2s",
      opacity: disabled ? 0.5 : 1,
      fontFamily: "inherit",
      ...extraStyle,
    }}>{children}</button>
  );
}

function Field({ label, value, onChange, placeholder, hint, textarea, S: _S }) {
  const Tag = textarea ? "textarea" : "input";
  return (
    <div>
      <label style={{ fontSize: 11, fontWeight: 600, color: "#D1D5DB", marginBottom: 3, display: "block" }}>{label}</label>
      <Tag className="ip" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} {...(textarea ? { rows: 3 } : {})} />
      {hint && <p style={{ fontSize: 10, color: "#818CF8", marginTop: 3 }}>{hint}</p>}
    </div>
  );
}
