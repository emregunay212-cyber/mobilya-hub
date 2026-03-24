import { getAdminClient } from "@/lib/supabase";
import { requireAdmin, authError } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return authError(denied);

  const admin = getAdminClient();
  const { searchParams } = new URL(request.url);
  const storeId = searchParams.get("store_id");

  // Total stores
  const { count: storeCount } = await admin
    .from("stores")
    .select("*", { count: "exact", head: true });

  // Total products
  let productQuery = admin.from("products").select("*", { count: "exact", head: true });
  if (storeId) productQuery = productQuery.eq("store_id", storeId);
  const { count: productCount } = await productQuery;

  // Orders stats - use columns that exist in DB
  let orderQuery = admin.from("orders").select("total, status, created_at");
  if (storeId) orderQuery = orderQuery.eq("store_id", storeId);
  const { data: orders } = await orderQuery;

  const allOrders = orders || [];
  const totalRevenue = allOrders
    .filter((o) => o.status === "delivered" || o.status === "confirmed")
    .reduce((sum, o) => sum + Number(o.total), 0);

  const pendingOrders = allOrders.filter((o) => o.status === "pending").length;
  const completedOrders = allOrders.filter((o) => o.status === "delivered").length;

  // Last 30 days daily revenue
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const dailyRevenue: Record<string, number> = {};
  const dailyOrders: Record<string, number> = {};

  for (const order of allOrders) {
    const date = new Date(order.created_at).toISOString().split("T")[0];
    if (new Date(order.created_at) >= thirtyDaysAgo) {
      dailyOrders[date] = (dailyOrders[date] || 0) + 1;
      if (order.status === "delivered" || order.status === "confirmed") {
        dailyRevenue[date] = (dailyRevenue[date] || 0) + Number(order.total);
      }
    }
  }

  // Status breakdown
  const statusBreakdown: Record<string, number> = {};
  for (const order of allOrders) {
    statusBreakdown[order.status] = (statusBreakdown[order.status] || 0) + 1;
  }

  // Top products (by order item count)
  let topProductsQuery = admin
    .from("order_items")
    .select("product_name, quantity");

  const { data: orderItems } = await topProductsQuery;
  const productSales: Record<string, number> = {};
  for (const item of orderItems || []) {
    productSales[item.product_name] = (productSales[item.product_name] || 0) + item.quantity;
  }
  const topProducts = Object.entries(productSales)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));

  return NextResponse.json({
    storeCount: storeCount || 0,
    productCount: productCount || 0,
    orderCount: allOrders.length,
    totalRevenue,
    pendingOrders,
    completedOrders,
    dailyRevenue,
    dailyOrders,
    statusBreakdown,
    topProducts,
  });
}
