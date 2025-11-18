-- Migration for Seller Dashboard features
-- Adds product archiving, shipments table, and store team members table

-- Add archived field to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS archived BOOLEAN NOT NULL DEFAULT false;

-- Create index on archived field for faster queries
CREATE INDEX IF NOT EXISTS idx_products_archived ON products(archived);
CREATE INDEX IF NOT EXISTS idx_products_store_archived ON products(store_id, archived) WHERE archived = false;

-- Create shipments table
CREATE TABLE IF NOT EXISTS shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  tracking_number VARCHAR(255),
  carrier VARCHAR(100),
  status VARCHAR(50) NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'shipped', 'in_transit', 'delivered', 'failed')),
  shipped_at TIMESTAMP WITH TIME ZONE,
  estimated_delivery TIMESTAMP WITH TIME ZONE,
  actual_delivery TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_shipments_order ON shipments(order_id);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status);
CREATE INDEX IF NOT EXISTS idx_shipments_tracking ON shipments(tracking_number) WHERE tracking_number IS NOT NULL;

-- Create store_team_members table
CREATE TABLE IF NOT EXISTS store_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL DEFAULT 'staff' 
    CHECK (role IN ('owner', 'manager', 'staff')),
  permissions JSONB DEFAULT '{}',
  invited_by UUID REFERENCES users(id),
  invited_at TIMESTAMP WITH TIME ZONE,
  joined_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(store_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_store_team_store ON store_team_members(store_id);
CREATE INDEX IF NOT EXISTS idx_store_team_user ON store_team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_store_team_role ON store_team_members(role);

-- Add trigger for updated_at on shipments
CREATE TRIGGER update_shipments_updated_at BEFORE UPDATE ON shipments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add trigger for updated_at on store_team_members
CREATE TRIGGER update_store_team_members_updated_at BEFORE UPDATE ON store_team_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_team_members ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- SHIPMENTS TABLE POLICIES
-- =====================================================

-- Allow sellers to read shipments for orders containing their products
CREATE POLICY "Sellers can read own shipments"
ON shipments
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM orders
    INNER JOIN order_items ON orders.id = order_items.order_id
    INNER JOIN products ON order_items.product_id = products.id
    INNER JOIN stores ON products.store_id = stores.id
    WHERE shipments.order_id = orders.id
    AND stores.owner_id = auth.uid()
  )
);

-- Allow sellers to create shipments for their orders
CREATE POLICY "Sellers can create shipments"
ON shipments
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders
    INNER JOIN order_items ON orders.id = order_items.order_id
    INNER JOIN products ON order_items.product_id = products.id
    INNER JOIN stores ON products.store_id = stores.id
    WHERE shipments.order_id = orders.id
    AND stores.owner_id = auth.uid()
  )
);

-- Allow sellers to update their shipments
CREATE POLICY "Sellers can update own shipments"
ON shipments
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM orders
    INNER JOIN order_items ON orders.id = order_items.order_id
    INNER JOIN products ON order_items.product_id = products.id
    INNER JOIN stores ON products.store_id = stores.id
    WHERE shipments.order_id = orders.id
    AND stores.owner_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders
    INNER JOIN order_items ON orders.id = order_items.order_id
    INNER JOIN products ON order_items.product_id = products.id
    INNER JOIN stores ON products.store_id = stores.id
    WHERE shipments.order_id = orders.id
    AND stores.owner_id = auth.uid()
  )
);

-- Allow service role full access
CREATE POLICY "Service role has full access to shipments"
ON shipments
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- =====================================================
-- STORE_TEAM_MEMBERS TABLE POLICIES
-- =====================================================

-- Allow store owners to read team members
CREATE POLICY "Store owners can read team members"
ON store_team_members
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM stores
    WHERE stores.id = store_team_members.store_id
    AND stores.owner_id = auth.uid()
  )
);

-- Allow team members to read their own assignments
CREATE POLICY "Team members can read own assignments"
ON store_team_members
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Allow store owners to manage team members
CREATE POLICY "Store owners can insert team members"
ON store_team_members
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM stores
    WHERE stores.id = store_team_members.store_id
    AND stores.owner_id = auth.uid()
  )
);

CREATE POLICY "Store owners can update team members"
ON store_team_members
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM stores
    WHERE stores.id = store_team_members.store_id
    AND stores.owner_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM stores
    WHERE stores.id = store_team_members.store_id
    AND stores.owner_id = auth.uid()
  )
);

CREATE POLICY "Store owners can delete team members"
ON store_team_members
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM stores
    WHERE stores.id = store_team_members.store_id
    AND stores.owner_id = auth.uid()
  )
);

-- Allow service role full access
CREATE POLICY "Service role has full access to store_team_members"
ON store_team_members
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- =====================================================
-- UPDATE PRODUCTS POLICIES FOR ARCHIVED FIELD
-- =====================================================

-- Update existing products policies to exclude archived products from public view
-- (The existing policies already filter by store verification, archived is additional filter)
-- Sellers can see all their products (archived or not)
-- Public can only see non-archived products from verified stores

DROP POLICY IF EXISTS "Public can read products from verified stores" ON products;
CREATE POLICY "Public can read products from verified stores"
ON products
FOR SELECT
TO anon, authenticated
USING (
  archived = false
  AND EXISTS (
    SELECT 1 FROM stores 
    WHERE stores.id = products.store_id 
    AND stores.verification_status = 'verified'
  )
);

-- =====================================================
-- END OF MIGRATION
-- =====================================================

