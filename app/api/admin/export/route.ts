import { getAdminClient } from "@/lib/supabase";
import { requireAdmin, authError } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return authError(denied);

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type"); // orders, products, customers
  const storeId = searchParams.get("store_id");

  if (!type) return NextResponse.json({ error: "type gerekli (orders/products/customers)" }, { status: 400 });

  const admin = getAdminClient();
  let csvContent = "";

  if (type === "orders") {
    let query = admin.from("orders").select("order_number, status, total, notes, created_at");
    if (storeId) query = query.eq("store_id", storeId);
    const { data } = await query.order("created_at", { ascending: false });

    csvContent = "Siparis No,Durum,Toplam,Notlar,Tarih\n";
    (data || []).forEach((o) => {
      csvContent += `${o.order_number},${o.status},${o.total},"${o.notes || ""}",${new Date(o.created_at).toLocaleDateString("tr-TR")}\n`;
    });
  } else if (type === "products") {
    let query = admin.from("products").select("name, slug, price, old_price, stock_count, in_stock, categories(name)");
    if (storeId) query = query.eq("store_id", storeId);
    const { data } = await query.order("sort_order");

    csvContent = "Urun Adi,Slug,Fiyat,Eski Fiyat,Stok,Stokta,Kategori\n";
    (data || []).forEach((p) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const catName = (p.categories as any)?.name || "";
      csvContent += `"${p.name}",${p.slug},${p.price},${p.old_price || ""},${p.stock_count},${p.in_stock},${catName}\n`;
    });
  } else if (type === "customers") {
    let query = admin.from("customers").select("full_name, email, phone, city, created_at");
    if (storeId) query = query.eq("store_id", storeId);
    const { data } = await query.order("created_at", { ascending: false });

    csvContent = "Musteri,Email,Telefon,Sehir,Kayit Tarihi\n";
    (data || []).forEach((c) => {
      csvContent += `"${c.full_name || ""}",${c.email || ""},${c.phone || ""},${c.city || ""},${new Date(c.created_at).toLocaleDateString("tr-TR")}\n`;
    });
  }

  return new NextResponse(csvContent, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${type}_export_${Date.now()}.csv"`,
    },
  });
}
