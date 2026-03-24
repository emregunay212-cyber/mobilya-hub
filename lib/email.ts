/**
 * Email notification service.
 * Uses Supabase Edge Functions or Resend/Nodemailer.
 * For now, uses a simple fetch-based approach compatible with Resend API.
 */

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const DEFAULT_FROM = process.env.EMAIL_FROM || "MobilyaHub <noreply@mobilyahub.com>";

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.warn("[Email] RESEND_API_KEY not set, skipping email:", options.subject);
    return false;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: options.from || DEFAULT_FROM,
        to: options.to,
        subject: options.subject,
        html: options.html,
      }),
    });

    return res.ok;
  } catch (err) {
    console.error("[Email] Send failed:", err);
    return false;
  }
}

/* ── Email Templates ─────────────────────────────────── */

export function orderConfirmationEmail(order: {
  order_number: string;
  customer_name: string;
  total: number;
  items: Array<{ product_name: string; quantity: number; unit_price: number }>;
  storeName?: string;
}): string {
  const itemsHtml = order.items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px;border-bottom:1px solid #eee">${item.product_name}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${item.quantity}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${(item.unit_price * item.quantity).toLocaleString("tr-TR")} TL</td>
        </tr>`
    )
    .join("");

  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
      <h2 style="color:#6366F1">Siparis Onayiniz</h2>
      <p>Merhaba ${order.customer_name},</p>
      <p>Siparissiniz basariyla alindi. Siparis detaylariniz asagidadir:</p>

      <div style="background:#f9fafb;padding:16px;border-radius:8px;margin:16px 0">
        <p style="margin:0"><strong>Siparis No:</strong> ${order.order_number}</p>
        ${order.storeName ? `<p style="margin:4px 0 0"><strong>Magaza:</strong> ${order.storeName}</p>` : ""}
      </div>

      <table style="width:100%;border-collapse:collapse">
        <thead>
          <tr style="background:#f3f4f6">
            <th style="padding:8px;text-align:left">Urun</th>
            <th style="padding:8px;text-align:center">Adet</th>
            <th style="padding:8px;text-align:right">Tutar</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding:8px;text-align:right;font-weight:bold">Toplam:</td>
            <td style="padding:8px;text-align:right;font-weight:bold;color:#10B981">${order.total.toLocaleString("tr-TR")} TL</td>
          </tr>
        </tfoot>
      </table>

      <p style="color:#6b7280;font-size:14px;margin-top:24px">
        Siparisinizin durumunu takip etmek icin siparis numaranizi kullanabilirsiniz.
      </p>
    </div>
  `;
}

export function orderStatusEmail(order: {
  order_number: string;
  customer_name: string;
  status: string;
  tracking_number?: string;
}): string {
  const statusLabels: Record<string, string> = {
    confirmed: "Onaylandi",
    processing: "Hazirlaniyor",
    shipped: "Kargoya Verildi",
    delivered: "Teslim Edildi",
    cancelled: "Iptal Edildi",
  };

  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
      <h2 style="color:#6366F1">Siparis Durumu Guncellendi</h2>
      <p>Merhaba ${order.customer_name},</p>
      <p><strong>${order.order_number}</strong> numarali siparisinizin durumu guncellendi:</p>

      <div style="background:#f0fdf4;padding:16px;border-radius:8px;margin:16px 0;text-align:center">
        <p style="font-size:18px;font-weight:bold;color:#10B981;margin:0">
          ${statusLabels[order.status] || order.status}
        </p>
      </div>

      ${
        order.tracking_number
          ? `<p><strong>Kargo Takip No:</strong> ${order.tracking_number}</p>`
          : ""
      }

      <p style="color:#6b7280;font-size:14px;margin-top:24px">
        Sorulariniz icin magazamizla iletisime gecebilirsiniz.
      </p>
    </div>
  `;
}

export function lowStockEmail(product: {
  name: string;
  stock_count: number;
  storeName: string;
}): string {
  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
      <h2 style="color:#F59E0B">Dusuk Stok Uyarisi</h2>
      <p><strong>${product.storeName}</strong> magazasinda bir urunun stoku azaliyor:</p>
      <div style="background:#fffbeb;padding:16px;border-radius:8px;margin:16px 0">
        <p style="margin:0"><strong>Urun:</strong> ${product.name}</p>
        <p style="margin:4px 0 0"><strong>Kalan Stok:</strong> ${product.stock_count} adet</p>
      </div>
      <p style="color:#6b7280;font-size:14px">Stok guncellemesi icin admin paneline gidin.</p>
    </div>
  `;
}
