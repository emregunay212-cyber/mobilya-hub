-- =============================================
-- Mobilya Hub v3: Platform Upgrade Migration
-- =============================================

-- 1. Admin Users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  full_name text,
  role text DEFAULT 'admin' CHECK (role IN ('superadmin', 'admin')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  last_login_at timestamptz
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY admin_users_service_only ON admin_users FOR ALL USING (auth.role() = 'service_role');

-- 2. Sector Templates table
CREATE TABLE IF NOT EXISTS sector_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  icon text,
  default_categories jsonb NOT NULL DEFAULT '[]',
  default_theme text DEFAULT 'classic-warm',
  available_themes text[] DEFAULT '{}',
  hero_config jsonb DEFAULT '{}',
  trust_bar_items jsonb DEFAULT '[]',
  features jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sector_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY sector_templates_read ON sector_templates FOR SELECT USING (true);
CREATE POLICY sector_templates_admin ON sector_templates FOR ALL USING (auth.role() = 'service_role');

-- 3. Deployments table
CREATE TABLE IF NOT EXISTS deployments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid REFERENCES stores(id) ON DELETE CASCADE,
  github_repo_url text,
  github_repo_name text,
  vercel_project_id text,
  vercel_project_url text,
  custom_domain text,
  status text DEFAULT 'pending' CHECK (status IN (
    'pending', 'generating', 'pushing', 'deploying', 'active', 'failed', 'deleted'
  )),
  error_message text,
  last_deployed_at timestamptz,
  deploy_config jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE deployments ENABLE ROW LEVEL SECURITY;
CREATE POLICY deployments_service_only ON deployments FOR ALL USING (auth.role() = 'service_role');

-- 4. Payment Configs table
CREATE TABLE IF NOT EXISTS payment_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid UNIQUE REFERENCES stores(id) ON DELETE CASCADE,
  provider text NOT NULL DEFAULT 'none' CHECK (provider IN ('iyzico', 'stripe', 'none')),
  is_live boolean DEFAULT false,
  config jsonb DEFAULT '{}',
  currency text DEFAULT 'TRY',
  installment_options jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE payment_configs ENABLE ROW LEVEL SECURITY;
CREATE POLICY payment_configs_service_only ON payment_configs FOR ALL USING (auth.role() = 'service_role');

-- 5. Modify existing stores table
ALTER TABLE stores ADD COLUMN IF NOT EXISTS sector_id uuid REFERENCES sector_templates(id);
ALTER TABLE stores ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES admin_users(id);
ALTER TABLE stores ADD COLUMN IF NOT EXISTS payment_enabled boolean DEFAULT false;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS deployment_id uuid REFERENCES deployments(id);

-- Add unique constraint on custom_domain (if not null)
CREATE UNIQUE INDEX IF NOT EXISTS stores_custom_domain_unique ON stores (custom_domain) WHERE custom_domain IS NOT NULL;

-- 6. Modify categories table
ALTER TABLE categories ADD COLUMN IF NOT EXISTS is_default boolean DEFAULT false;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS icon text;

-- 7. Modify products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}';

-- 8. Insert default sector templates
INSERT INTO sector_templates (slug, name, description, icon, default_categories, default_theme, available_themes)
VALUES
  ('mobilyaci', 'Mobilyacı', 'Mobilya mağazaları için profesyonel web sitesi', '🛋️',
   '[{"name":"Koltuk Takımları","slug":"koltuk-takimlari"},{"name":"Yatak Odası","slug":"yatak-odasi"},{"name":"Yemek Odası","slug":"yemek-odasi"},{"name":"TV Ünitesi","slug":"tv-unitesi"},{"name":"Genç Odası","slug":"genc-odasi"},{"name":"Mutfak","slug":"mutfak"}]',
   'classic-warm', ARRAY['classic-warm','navy-gold','modern-minimal','forest-natural','cream-elegant']),

  ('kuyumcu', 'Kuyumcu', 'Kuyumcu ve mücevherat mağazaları için web sitesi', '💎',
   '[{"name":"Yüzük","slug":"yuzuk"},{"name":"Kolye","slug":"kolye"},{"name":"Bileklik","slug":"bileklik"},{"name":"Küpe","slug":"kupe"},{"name":"Set Takım","slug":"set-takim"},{"name":"Pırlanta","slug":"pirlanta"},{"name":"Altın","slug":"altin"}]',
   'navy-gold', ARRAY['navy-gold','cream-elegant','modern-minimal','jewel-sparkle']),

  ('cafe', 'Cafe & Restoran', 'Cafe, restoran ve yeme-içme mekanları için web sitesi', '☕',
   '[{"name":"Sıcak İçecekler","slug":"sicak-icecekler"},{"name":"Soğuk İçecekler","slug":"soguk-icecekler"},{"name":"Kahvaltı","slug":"kahvalti"},{"name":"Tatlılar","slug":"tatlilar"},{"name":"Sandviç & Tost","slug":"sandvic-tost"},{"name":"Salata","slug":"salata"}]',
   'forest-natural', ARRAY['forest-natural','modern-minimal','cream-elegant','cafe-cozy']),

  ('oto-galeri', 'Oto Galeri', 'Oto galeri ve araç satış siteleri için web sitesi', '🚗',
   '[{"name":"Otomobil","slug":"otomobil"},{"name":"SUV","slug":"suv"},{"name":"Ticari Araç","slug":"ticari-arac"},{"name":"Motosiklet","slug":"motosiklet"}]',
   'modern-minimal', ARRAY['modern-minimal','navy-gold','auto-dark'])
ON CONFLICT (slug) DO NOTHING;

-- 9. Harden existing RLS policies
-- Drop overly permissive policies if they exist
DO $$
BEGIN
  -- These may not exist in all environments, so we use exception handling
  BEGIN DROP POLICY IF EXISTS customers_insert_anon ON customers; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN DROP POLICY IF EXISTS orders_insert_anon ON orders; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN DROP POLICY IF EXISTS order_items_insert_anon ON order_items; EXCEPTION WHEN OTHERS THEN NULL; END;
END $$;

-- Recreate with scoped policies (only if tables exist)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'customers') THEN
    EXECUTE 'CREATE POLICY IF NOT EXISTS customers_insert_scoped ON customers FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM stores WHERE id = store_id AND is_active = true))';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders') THEN
    EXECUTE 'CREATE POLICY IF NOT EXISTS orders_insert_scoped ON orders FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM stores WHERE id = store_id AND is_active = true))';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'order_items') THEN
    EXECUTE 'CREATE POLICY IF NOT EXISTS order_items_insert_scoped ON order_items FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM orders WHERE id = order_id))';
  END IF;
END $$;
