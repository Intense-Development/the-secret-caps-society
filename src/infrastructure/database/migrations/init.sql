
-- Create stores table
CREATE TABLE IF NOT EXISTS stores (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  owner VARCHAR(255) NOT NULL,
  products INTEGER NOT NULL DEFAULT 0,
  verified BOOLEAN NOT NULL DEFAULT false,
  location VARCHAR(255) NOT NULL,
  photo VARCHAR(512),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  image VARCHAR(255) NOT NULL,
  store_name VARCHAR(255) NOT NULL,
  is_new BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  is_sold_out BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample stores data
INSERT INTO stores (name, owner, products, verified, location, photo)
VALUES 
  ('CapCity Store', 'Jane Smith', 45, true, 'New York, NY', 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=500&h=350&fit=crop'),
  ('East Coast Caps', 'Michael Wilson', 32, true, 'Boston, MA', 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=500&h=350&fit=crop'),
  ('West Side Hats', 'Robert Brown', 18, false, 'Los Angeles, CA', 'https://images.unsplash.com/photo-1496307653780-42ee777d4833?w=500&h=350&fit=crop'),
  ('South Cap Depot', 'Amanda Lee', 27, true, 'Miami, FL', 'https://images.unsplash.com/photo-1431576901776-e539bd916ba2?w=500&h=350&fit=crop'),
  ('Midwest Cap Collection', 'David Miller', 15, false, 'Chicago, IL', 'https://images.unsplash.com/photo-1449157291145-7efd050a4d0e?w=500&h=350&fit=crop')
ON CONFLICT (id) DO NOTHING;
