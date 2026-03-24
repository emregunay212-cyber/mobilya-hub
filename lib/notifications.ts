import { sendEmail, orderConfirmationEmail, orderStatusEmail, lowStockEmail } from "./email";
import { getAdminClient } from "./supabase";

/**
 * Notify store admin about new order via email.
 */
export async function notifyNewOrder(order: {
  order_number: string;
  customer_name: string;
  customer_email: string;
  total: number;
  store_id: string;
  items: Array<{ product_name: string; quantity: number; unit_price: number }>;
}) {
  const admin = getAdminClient();

  // Get store info
  const { data: store } = await admin
    .from("stores")
    .select("name, email, store_admin_email")
    .eq("id", order.store_id)
    .single();

  if (!store) return;

  // Send confirmation to customer
  await sendEmail({
    to: order.customer_email,
    subject: `Siparis Onayiniz - ${order.order_number}`,
    html: orderConfirmationEmail({
      order_number: order.order_number,
      customer_name: order.customer_name,
      total: order.total,
      items: order.items,
      storeName: store.name,
    }),
  });

  // Notify store admin
  const adminEmail = store.store_admin_email || store.email;
  if (adminEmail) {
    await sendEmail({
      to: adminEmail,
      subject: `Yeni Siparis! ${order.order_number} - ${order.customer_name}`,
      html: `
        <div style="font-family:sans-serif;padding:20px">
          <h2 style="color:#6366F1">Yeni Siparis Geldi!</h2>
          <p><strong>Siparis No:</strong> ${order.order_number}</p>
          <p><strong>Musteri:</strong> ${order.customer_name} (${order.customer_email})</p>
          <p><strong>Toplam:</strong> ${order.total.toLocaleString("tr-TR")} TL</p>
          <p><strong>Urun Sayisi:</strong> ${order.items.length}</p>
          <hr style="border:none;border-top:1px solid #eee;margin:16px 0"/>
          <p style="color:#6b7280;font-size:14px">Admin panelden siparisi goruntuleyebilirsiniz.</p>
        </div>
      `,
    });
  }
}

/**
 * Notify customer about order status change.
 */
export async function notifyOrderStatusChange(orderId: string) {
  const admin = getAdminClient();
  const { data: order } = await admin
    .from("orders")
    .select("order_number, customer_name, customer_email, status, tracking_number")
    .eq("id", orderId)
    .single();

  if (!order) return;

  await sendEmail({
    to: order.customer_email,
    subject: `Siparis Durumu Guncellendi - ${order.order_number}`,
    html: orderStatusEmail({
      order_number: order.order_number,
      customer_name: order.customer_name,
      status: order.status,
      tracking_number: order.tracking_number,
    }),
  });
}

/**
 * Check and notify for low stock products.
 */
export async function checkLowStock(storeId: string, threshold = 5) {
  const admin = getAdminClient();
  const { data: store } = await admin.from("stores").select("name, email").eq("id", storeId).single();
  if (!store?.email) return;

  const { data: products } = await admin
    .from("products")
    .select("name, stock_count")
    .eq("store_id", storeId)
    .eq("in_stock", true)
    .lte("stock_count", threshold)
    .gt("stock_count", 0);

  if (products && products.length > 0) {
    for (const product of products) {
      await sendEmail({
        to: store.email,
        subject: `Dusuk Stok Uyarisi - ${product.name}`,
        html: lowStockEmail({
          name: product.name,
          stock_count: product.stock_count,
          storeName: store.name,
        }),
      });
    }
  }
}
