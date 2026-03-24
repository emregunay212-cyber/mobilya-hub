/**
 * Database types matching Supabase tables.
 * These should be regenerated with `supabase gen types typescript` when schema changes.
 */

export interface Store {
  id: string;
  name: string;
  slug: string;
  phone: string;
  whatsapp?: string | null;
  email?: string | null;
  address?: string | null;
  city: string;
  description?: string | null;
  instagram?: string | null;
  custom_domain?: string | null;
  settings: { theme?: string; [key: string]: unknown };
  is_active: boolean;
  sector_id?: string | null;
  owner_id?: string | null;
  payment_enabled?: boolean;
  deployment_id?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  store_id: string;
  name: string;
  slug: string;
  sort_order: number;
  is_default?: boolean;
  icon?: string | null;
}

export interface Product {
  id: string;
  store_id: string;
  category_id?: string | null;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  old_price?: number | null;
  badge?: string | null;
  in_stock: boolean;
  is_active: boolean;
  stock_count: number;
  images: string[];
  sort_order: number;
  metadata?: Record<string, unknown>;
  categories?: { name: string; slug: string } | null;
  created_at: string;
  updated_at?: string;
}

export interface AdminUser {
  id: string;
  email: string;
  password_hash: string;
  full_name?: string | null;
  role: "superadmin" | "admin";
  is_active: boolean;
  created_at: string;
  last_login_at?: string | null;
}

export interface SectorTemplate {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  default_categories: { name: string; slug: string; icon?: string }[];
  default_theme: string;
  available_themes: string[];
  hero_config: Record<string, unknown>;
  trust_bar_items: { icon: string; title: string; subtitle: string }[];
  features: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
}

export interface Deployment {
  id: string;
  store_id: string;
  github_repo_url?: string | null;
  github_repo_name?: string | null;
  vercel_project_id?: string | null;
  vercel_project_url?: string | null;
  custom_domain?: string | null;
  status: "pending" | "generating" | "pushing" | "deploying" | "active" | "failed" | "deleted";
  error_message?: string | null;
  last_deployed_at?: string | null;
  deploy_config: Record<string, unknown>;
  created_at: string;
  updated_at?: string;
}

export interface PaymentConfig {
  id: string;
  store_id: string;
  provider: "iyzico" | "stripe" | "none";
  is_live: boolean;
  config: Record<string, string>;
  currency: string;
  installment_options: number[];
  created_at: string;
  updated_at?: string;
}

export interface Customer {
  id: string;
  store_id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  store_id: string;
  customer_id?: string | null;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  total: number;
  payment_provider?: string | null;
  payment_id?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total: number;
}
