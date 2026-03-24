-- Customer accounts extension
ALTER TABLE customers ADD COLUMN IF NOT EXISTS password_hash text;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS last_login_at timestamptz;

-- Favorites table
CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(customer_id, product_id)
);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY favorites_service_only ON favorites FOR ALL USING (auth.role() = 'service_role');

-- Product reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  is_approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY reviews_service_only ON reviews FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY reviews_read_approved ON reviews FOR SELECT USING (is_approved = true);

-- Newsletter subscribers
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  email text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(store_id, email)
);

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY newsletter_service_only ON newsletter_subscribers FOR ALL USING (auth.role() = 'service_role');

-- Blog posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  title text NOT NULL,
  slug text NOT NULL,
  content text,
  excerpt text,
  cover_image text,
  is_published boolean DEFAULT false,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(store_id, slug)
);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY blog_posts_service_only ON blog_posts FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY blog_posts_read_published ON blog_posts FOR SELECT USING (is_published = true);

-- Campaign banners table
CREATE TABLE IF NOT EXISTS banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  title text NOT NULL,
  subtitle text,
  image_url text,
  link_url text,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  starts_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
CREATE POLICY banners_service_only ON banners FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY banners_read_active ON banners FOR SELECT USING (is_active = true);

-- Store admin roles
ALTER TABLE stores ADD COLUMN IF NOT EXISTS store_admin_email text;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS store_admin_password_hash text;
