/**
 * Input validation helpers for API routes.
 */

export function validateStore(body) {
  const errors = [];

  if (!body.name || typeof body.name !== "string" || body.name.trim().length < 2) {
    errors.push("Mağaza adı en az 2 karakter olmalı");
  }
  if (body.name && body.name.length > 100) {
    errors.push("Mağaza adı en fazla 100 karakter olabilir");
  }

  if (!body.slug || typeof body.slug !== "string" || !/^[a-z0-9-]+$/.test(body.slug)) {
    errors.push("Geçerli bir slug gerekli (küçük harf, rakam, tire)");
  }

  const RESERVED_SLUGS = ["admin", "api", "urun", "_next", "favicon", "static", "login", "register", "checkout", "webhook"];
  if (body.slug && RESERVED_SLUGS.includes(body.slug)) {
    errors.push("Bu slug kullanılamaz (ayrılmış kelime)");
  }

  if (!body.phone || typeof body.phone !== "string" || body.phone.trim().length < 7) {
    errors.push("Geçerli bir telefon numarası gerekli");
  }

  if (body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    errors.push("Geçersiz e-posta adresi");
  }

  if (body.whatsapp && !/^\d{10,15}$/.test(body.whatsapp.replace(/\s/g, ""))) {
    errors.push("WhatsApp numarası 10-15 rakam olmalı");
  }

  if (body.categories && Array.isArray(body.categories)) {
    if (body.categories.length > 20) {
      errors.push("En fazla 20 kategori eklenebilir");
    }
    for (const cat of body.categories) {
      if (!cat.name || typeof cat.name !== "string" || cat.name.trim().length < 1) {
        errors.push("Kategori adı boş olamaz");
        break;
      }
    }
  }

  return errors.length > 0 ? errors : null;
}

export function validateProduct(body) {
  const errors = [];

  if (!body.store_id || typeof body.store_id !== "string") {
    errors.push("store_id gerekli");
  }

  if (!body.name || typeof body.name !== "string" || body.name.trim().length < 2) {
    errors.push("Ürün adı en az 2 karakter olmalı");
  }
  if (body.name && body.name.length > 200) {
    errors.push("Ürün adı en fazla 200 karakter olabilir");
  }

  if (!body.slug || typeof body.slug !== "string" || !/^[a-z0-9-]+$/.test(body.slug)) {
    errors.push("Geçerli bir slug gerekli");
  }

  if (body.price == null || isNaN(Number(body.price)) || Number(body.price) < 0) {
    errors.push("Geçerli bir fiyat gerekli");
  }

  if (body.old_price != null && (isNaN(Number(body.old_price)) || Number(body.old_price) < 0)) {
    errors.push("Eski fiyat geçersiz");
  }

  if (body.stock_count != null && (isNaN(Number(body.stock_count)) || Number(body.stock_count) < 0)) {
    errors.push("Stok adedi geçersiz");
  }

  return errors.length > 0 ? errors : null;
}

export function sanitizeString(str, maxLength = 500) {
  if (typeof str !== "string") return "";
  return str.trim().slice(0, maxLength);
}
