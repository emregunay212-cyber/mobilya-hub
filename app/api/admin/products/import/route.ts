import { getAdminClient } from "@/lib/supabase";
import { requireAdmin, authError } from "@/lib/auth";
import { sanitizeString } from "@/lib/validate";
import { NextResponse } from "next/server";

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] || "";
    });
    rows.push(row);
  }
  return rows;
}

function autoSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
    .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function POST(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return authError(denied);

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const storeId = formData.get("store_id") as string;

  if (!file || !storeId) {
    return NextResponse.json({ error: "file ve store_id gerekli" }, { status: 400 });
  }

  const text = await file.text();
  const rows = parseCSV(text);

  if (rows.length === 0) {
    return NextResponse.json({ error: "CSV bos veya gecersiz format" }, { status: 400 });
  }

  if (rows.length > 500) {
    return NextResponse.json({ error: "Maksimum 500 urun yukenebilir" }, { status: 400 });
  }

  const admin = getAdminClient();
  let imported = 0;
  let skipped = 0;
  const errors: string[] = [];

  // Get existing categories for mapping
  const { data: categories } = await admin
    .from("categories")
    .select("id, name, slug")
    .eq("store_id", storeId);
  const catMap = new Map((categories || []).map((c) => [c.name.toLowerCase(), c.id]));

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const name = row.name || row.urun_adi || row.title;
    const price = Number(row.price || row.fiyat || 0);

    if (!name || price <= 0) {
      skipped++;
      errors.push(`Satir ${i + 2}: Isim veya fiyat eksik`);
      continue;
    }

    const slug = row.slug || autoSlug(name);
    const categoryName = (row.category || row.kategori || "").toLowerCase();
    const categoryId = catMap.get(categoryName) || null;

    try {
      await admin.from("products").insert({
        store_id: storeId,
        name: sanitizeString(name, 200),
        slug,
        description: row.description || row.aciklama || null,
        price,
        old_price: row.old_price || row.eski_fiyat ? Number(row.old_price || row.eski_fiyat) : null,
        badge: row.badge || null,
        in_stock: (row.in_stock || row.stok || "true").toLowerCase() !== "false",
        stock_count: Number(row.stock_count || row.stok_adedi || 0),
        category_id: categoryId,
        images: row.image || row.gorsel ? [row.image || row.gorsel] : [],
      });
      imported++;
    } catch {
      skipped++;
      errors.push(`Satir ${i + 2}: ${name} - kayit hatasi`);
    }
  }

  return NextResponse.json({
    success: true,
    imported,
    skipped,
    total: rows.length,
    errors: errors.slice(0, 10),
  });
}
