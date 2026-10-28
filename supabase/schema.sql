-- Schema for the existing Drizzle models. Run once in Supabase SQL Editor.
CREATE TABLE IF NOT EXISTS categories (
 id serial PRIMARY KEY, name text NOT NULL, slug text NOT NULL UNIQUE,
 tagline text, position integer NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS products (
 id serial PRIMARY KEY, category_id integer NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
 name text NOT NULL, slug text NOT NULL UNIQUE, description text NOT NULL DEFAULT '',
 image_url text, addon_scope text, sizes jsonb NOT NULL, tags text[] NOT NULL DEFAULT '{}',
 featured boolean NOT NULL DEFAULT false, available boolean NOT NULL DEFAULT true,
 position integer NOT NULL DEFAULT 0, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS addons (
 id serial PRIMARY KEY, name text NOT NULL, price_cents integer NOT NULL DEFAULT 0,
 scope text NOT NULL DEFAULT 'salgada', "group" text NOT NULL DEFAULT 'Extras',
 position integer NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS coupons (
 id serial PRIMARY KEY, code text NOT NULL UNIQUE, kind text NOT NULL DEFAULT 'percent',
 value integer NOT NULL DEFAULT 0, description text NOT NULL DEFAULT '',
 min_subtotal_cents integer NOT NULL DEFAULT 0, active boolean NOT NULL DEFAULT true
);
CREATE TABLE IF NOT EXISTS orders (
 id serial PRIMARY KEY, code text NOT NULL UNIQUE, customer_name text NOT NULL,
 phone text NOT NULL, fulfillment text NOT NULL DEFAULT 'delivery', street text,
 house_number text, complement text, district text, reference text,
 payment_method text NOT NULL DEFAULT 'pix', cash_change_for_cents integer,
 coupon_code text, notes text, subtotal_cents integer NOT NULL DEFAULT 0,
 discount_cents integer NOT NULL DEFAULT 0, delivery_fee_cents integer NOT NULL DEFAULT 0,
 total_cents integer NOT NULL DEFAULT 0, status text NOT NULL DEFAULT 'received',
 status_updated_at timestamptz NOT NULL DEFAULT now(),
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS order_items (
 id serial PRIMARY KEY, order_id integer NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
 product_id integer, product_name text NOT NULL, image_url text,
 size_id text NOT NULL, size_label text NOT NULL,
 unit_price_cents integer NOT NULL, quantity integer NOT NULL DEFAULT 1,
 selected_addons jsonb NOT NULL DEFAULT '[]'::jsonb,
 notes text, total_cents integer NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
-- These tables are accessed only by the trusted Next.js server through DATABASE_URL.
-- Do not expose the database password to browser clients.
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
