-- Complete database schema for The Secret Caps Society
-- This migration adds all tables needed for user registration and authentication

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  role VARCHAR(50) NOT NULL CHECK (role IN ('buyer', 'seller', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Drop old stores table if it exists and create new one
DROP TABLE IF EXISTS stores CASCADE;

CREATE TABLE stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  website VARCHAR(512),
  business_type VARCHAR(50) CHECK (business_type IN ('sole-proprietor', 'llc', 'corporation', 'partnership')),
  tax_id VARCHAR(100),
  address VARCHAR(512) NOT NULL,
  city VARCHAR(255) NOT NULL,
  state VARCHAR(255) NOT NULL,
  zip VARCHAR(20) NOT NULL,
  photo VARCHAR(512),
  verification_status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  verification_document_url VARCHAR(512),
  verified_at TIMESTAMP WITH TIME ZONE,
  products_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for stores
CREATE INDEX IF NOT EXISTS idx_stores_owner ON stores(owner_id);
CREATE INDEX IF NOT EXISTS idx_stores_verification ON stores(verification_status);

-- Update products table to use store_id instead of store_name
ALTER TABLE products DROP COLUMN IF EXISTS store_name;
ALTER TABLE products ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES stores(id) ON DELETE CASCADE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS category VARCHAR(100);
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 0;

-- Create index on store_id
CREATE INDEX IF NOT EXISTS idx_products_store ON products(store_id);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled', 'refunded')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_orders_buyer ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('stripe', 'paypal', 'cash')),
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  amount DECIMAL(10, 2) NOT NULL,
  transaction_id VARCHAR(255),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON stores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample admin user (password should be set via Supabase Auth)
INSERT INTO users (id, name, email, role)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Admin User', 'admin@secretcaps.com', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Insert sample seller users
INSERT INTO users (id, name, email, role)
VALUES 
  ('00000000-0000-0000-0000-000000000002', 'Jane Smith', 'jane@capcity.com', 'seller'),
  ('00000000-0000-0000-0000-000000000003', 'Michael Wilson', 'michael@eastcoastcaps.com', 'seller'),
  ('00000000-0000-0000-0000-000000000004', 'Robert Brown', 'robert@westsidehats.com', 'seller'),
  ('00000000-0000-0000-0000-000000000005', 'Amanda Lee', 'amanda@southcapdepot.com', 'seller'),
  ('00000000-0000-0000-0000-000000000006', 'David Miller', 'david@midwestcaps.com', 'seller')
ON CONFLICT (email) DO NOTHING;

-- Insert sample stores
INSERT INTO stores (owner_id, name, description, address, city, state, zip, business_type, verification_status, verified_at, products_count, photo)
VALUES 
  (
    '00000000-0000-0000-0000-000000000002',
    'CapCity Store',
    'Your premier destination for authentic caps and headwear',
    '123 Cap Street',
    'New York',
    'NY',
    '10001',
    'llc',
    'verified',
    CURRENT_TIMESTAMP,
    45,
    'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=500&h=350&fit=crop'
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    'East Coast Caps',
    'Quality caps from the heart of Boston',
    '456 Hat Avenue',
    'Boston',
    'MA',
    '02101',
    'sole-proprietor',
    'verified',
    CURRENT_TIMESTAMP,
    32,
    'https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=500&h=350&fit=crop'
  ),
  (
    '00000000-0000-0000-0000-000000000004',
    'West Side Hats',
    'LA''s finest selection of trendy caps',
    '789 Cap Boulevard',
    'Los Angeles',
    'CA',
    '90001',
    'partnership',
    'pending',
    NULL,
    18,
    'https://images.unsplash.com/photo-1496307653780-42ee777d4833?w=500&h=350&fit=crop'
  ),
  (
    '00000000-0000-0000-0000-000000000005',
    'South Cap Depot',
    'Miami''s most trusted cap retailer',
    '321 Beach Road',
    'Miami',
    'FL',
    '33101',
    'llc',
    'verified',
    CURRENT_TIMESTAMP,
    27,
    'https://images.unsplash.com/photo-1431576901776-e539bd916ba2?w=500&h=350&fit=crop'
  ),
  (
    '00000000-0000-0000-0000-000000000006',
    'Midwest Cap Collection',
    'Chicago''s underground cap scene',
    '654 Windy Lane',
    'Chicago',
    'IL',
    '60601',
    'corporation',
    'pending',
    NULL,
    15,
    'https://images.unsplash.com/photo-1449157291145-7efd050a4d0e?w=500&h=350&fit=crop'
  )
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================
-- These policies control who can read/write data in each table
-- CRITICAL: Without these, registration will fail with DATABASE_ERROR

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- USERS TABLE POLICIES
-- =====================================================

-- Allow anonymous users to create accounts during registration
CREATE POLICY "Allow user registration"
ON users
FOR INSERT
TO anon
WITH CHECK (true);

-- Allow authenticated users to read their own data
CREATE POLICY "Users can read own data"
ON users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Allow authenticated users to update their own data
CREATE POLICY "Users can update own data"
ON users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow service role full access (for admin operations)
CREATE POLICY "Service role has full access to users"
ON users
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- =====================================================
-- STORES TABLE POLICIES
-- =====================================================

-- Allow anonymous users to create stores during seller registration
CREATE POLICY "Allow store creation during registration"
ON stores
FOR INSERT
TO anon
WITH CHECK (true);

-- Allow public to read verified stores
CREATE POLICY "Public can read verified stores"
ON stores
FOR SELECT
TO anon, authenticated
USING (verification_status = 'verified');

-- Allow store owners to read their own stores (any status)
CREATE POLICY "Owners can read own stores"
ON stores
FOR SELECT
TO authenticated
USING (owner_id = auth.uid());

-- Allow store owners to update their own stores
CREATE POLICY "Owners can update own stores"
ON stores
FOR UPDATE
TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

-- Allow service role full access (for admin verification)
CREATE POLICY "Service role has full access to stores"
ON stores
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- =====================================================
-- PRODUCTS TABLE POLICIES
-- =====================================================

-- Allow public to read products from verified stores
CREATE POLICY "Public can read products from verified stores"
ON products
FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM stores 
    WHERE stores.id = products.store_id 
    AND stores.verification_status = 'verified'
  )
);

-- Allow store owners to manage their products
CREATE POLICY "Store owners can insert products"
ON products
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM stores 
    WHERE stores.id = products.store_id 
    AND stores.owner_id = auth.uid()
  )
);

CREATE POLICY "Store owners can update own products"
ON products
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM stores 
    WHERE stores.id = products.store_id 
    AND stores.owner_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM stores 
    WHERE stores.id = products.store_id 
    AND stores.owner_id = auth.uid()
  )
);

CREATE POLICY "Store owners can delete own products"
ON products
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM stores 
    WHERE stores.id = products.store_id 
    AND stores.owner_id = auth.uid()
  )
);

-- Allow service role full access
CREATE POLICY "Service role has full access to products"
ON products
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- =====================================================
-- ORDERS TABLE POLICIES
-- =====================================================

-- Allow authenticated users to create orders
CREATE POLICY "Authenticated users can create orders"
ON orders
FOR INSERT
TO authenticated
WITH CHECK (buyer_id = auth.uid());

-- Allow users to read their own orders
CREATE POLICY "Users can read own orders"
ON orders
FOR SELECT
TO authenticated
USING (buyer_id = auth.uid());

-- Allow users to update their own pending orders
CREATE POLICY "Users can update own pending orders"
ON orders
FOR UPDATE
TO authenticated
USING (buyer_id = auth.uid() AND status = 'pending')
WITH CHECK (buyer_id = auth.uid());

-- Allow service role full access
CREATE POLICY "Service role has full access to orders"
ON orders
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- =====================================================
-- ORDER_ITEMS TABLE POLICIES
-- =====================================================

-- Allow users to read items from their orders
CREATE POLICY "Users can read own order items"
ON order_items
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND orders.buyer_id = auth.uid()
  )
);

-- Allow users to insert items to their orders
CREATE POLICY "Users can add items to own orders"
ON order_items
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND orders.buyer_id = auth.uid()
  )
);

-- Allow service role full access
CREATE POLICY "Service role has full access to order_items"
ON order_items
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- =====================================================
-- PAYMENTS TABLE POLICIES
-- =====================================================

-- Allow users to read payments for their orders
CREATE POLICY "Users can read own payments"
ON payments
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = payments.order_id 
    AND orders.buyer_id = auth.uid()
  )
);

-- Payment creation handled by service role only (for security)
CREATE POLICY "Service role has full access to payments"
ON payments
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- =====================================================
-- END OF RLS POLICIES
-- =====================================================

