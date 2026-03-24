-- =============================================
-- Mobilya Hub: Orders System Migration
-- =============================================

-- 1. Customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL,
  phone text,
  address_line text,
  city text,
  district text,
  postal_code text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(store_id, email)
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY customers_service_only ON customers FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY customers_read_own ON customers FOR SELECT USING (true);
CREATE POLICY customers_insert_public ON customers FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM stores WHERE id = store_id AND is_active = true)
);

-- 2. Orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES customers(id),
  order_number text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN (
    'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'
  )),
  payment_status text DEFAULT 'pending' CHECK (payment_status IN (
    'pending', 'paid', 'failed', 'refunded'
  )),
  payment_method text DEFAULT 'cod' CHECK (payment_method IN (
    'cod', 'credit_card', 'bank_transfer', 'iyzico', 'stripe'
  )),
  payment_id text,
  subtotal numeric(12,2) NOT NULL DEFAULT 0,
  discount_amount numeric(12,2) DEFAULT 0,
  shipping_cost numeric(12,2) DEFAULT 0,
  total numeric(12,2) NOT NULL DEFAULT 0,
  currency text DEFAULT 'TRY',
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text,
  shipping_address text,
  shipping_city text,
  shipping_district text,
  shipping_postal_code text,
  tracking_number text,
  notes text,
  coupon_code text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY orders_service_only ON orders FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY orders_insert_public ON orders FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM stores WHERE id = store_id AND is_active = true)
);

-- Create unique index on order_number per store
CREATE UNIQUE INDEX IF NOT EXISTS orders_store_number_unique ON orders (store_id, order_number);

-- 3. Order Items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  product_slug text,
  product_image text,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price numeric(12,2) NOT NULL,
  total_price numeric(12,2) NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY order_items_service_only ON order_items FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY order_items_read ON order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE id = order_id)
);

-- 4. Coupons table
CREATE TABLE IF NOT EXISTS coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  code text NOT NULL,
  discount_type text DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value numeric(12,2) NOT NULL,
  min_order_amount numeric(12,2) DEFAULT 0,
  max_uses integer DEFAULT 0,
  used_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  starts_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(store_id, code)
);

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY coupons_service_only ON coupons FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY coupons_read_active ON coupons FOR SELECT USING (is_active = true);

-- 5. Store settings extension
ALTER TABLE stores ADD COLUMN IF NOT EXISTS logo_url text;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS social_links jsonb DEFAULT '{}';
ALTER TABLE stores ADD COLUMN IF NOT EXISTS working_hours jsonb DEFAULT '{}';
ALTER TABLE stores ADD COLUMN IF NOT EXISTS shipping_config jsonb DEFAULT '{"free_shipping_min": 0, "flat_rate": 0}';
