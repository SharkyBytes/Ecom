-- ======================================
--  Seller-Centric E-Commerce DB Init
-- ======================================

-- Drop & recreate database (optional, only in dev)
-- DROP DATABASE IF EXISTS ecommerce_seller;
-- CREATE DATABASE ecommerce_seller;
-- \c ecommerce_seller;  -- Connect to the database

-- ======================================
--  TABLE: addresses
-- ======================================
CREATE TABLE IF NOT EXISTS addresses (
    address_id BIGSERIAL PRIMARY KEY,
    line1 VARCHAR(255) NOT NULL,
    line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(20) NOT NULL,
    country VARCHAR(50) NOT NULL
);

-- ======================================
--  TABLE: sellers
-- ======================================
CREATE TABLE IF NOT EXISTS sellers (
    seller_id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    owner_name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    address_id BIGINT REFERENCES addresses(address_id),
    business_type VARCHAR(20) CHECK (business_type IN ('individual','company')),
    gst_number VARCHAR(50),
    kyc_status VARCHAR(20) DEFAULT 'pending' CHECK (kyc_status IN ('pending','verified','rejected')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ======================================
--  TABLE: categories
-- ======================================
CREATE TABLE IF NOT EXISTS categories (
    category_id BIGSERIAL PRIMARY KEY,
    parent_id BIGINT REFERENCES categories(category_id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL
);

-- ======================================
--  TABLE: products
-- ======================================
CREATE TABLE IF NOT EXISTS products (
    product_id BIGSERIAL PRIMARY KEY,
    seller_id BIGINT REFERENCES sellers(seller_id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category_id BIGINT REFERENCES categories(category_id),
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft','active','inactive')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ======================================
--  TABLE: product_variants
-- ======================================
CREATE TABLE IF NOT EXISTS product_variants (
    variant_id BIGSERIAL PRIMARY KEY,
    product_id BIGINT REFERENCES products(product_id) ON DELETE CASCADE,
    sku VARCHAR(50) UNIQUE NOT NULL,
    attributes JSONB,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    stock_quantity INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active','inactive'))
);

-- ======================================
--  TABLE: inventory (optional)
-- ======================================
CREATE TABLE IF NOT EXISTS inventory (
    inventory_id BIGSERIAL PRIMARY KEY,
    product_id BIGINT REFERENCES products(product_id) ON DELETE CASCADE,
    current_stock INT DEFAULT 0,
    reserved_stock INT DEFAULT 0,
    threshold_stock INT DEFAULT 0
);

-- ======================================
--  TABLE: orders
-- ======================================
CREATE TABLE IF NOT EXISTS orders (
    order_id BIGSERIAL PRIMARY KEY,
    buyer_id BIGINT, -- If multi-vendor marketplace, else NULL
    seller_id BIGINT REFERENCES sellers(seller_id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','confirmed','shipped','delivered','cancelled','returned')),
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending','paid','failed','refunded')),
    created_at TIMESTAMP DEFAULT NOW()
);

-- ======================================
--  TABLE: order_items
-- ======================================
CREATE TABLE IF NOT EXISTS order_items (
    order_item_id BIGSERIAL PRIMARY KEY,
    order_id BIGINT REFERENCES orders(order_id) ON DELETE CASCADE,
    product_id BIGINT REFERENCES products(product_id),
    variant_id BIGINT REFERENCES product_variants(variant_id),
    quantity INT NOT NULL CHECK (quantity > 0),
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0)
);

-- ======================================
--  TABLE: shipments
-- ======================================
CREATE TABLE IF NOT EXISTS shipments (
    shipment_id BIGSERIAL PRIMARY KEY,
    order_id BIGINT REFERENCES orders(order_id) ON DELETE CASCADE,
    tracking_number VARCHAR(255),
    carrier VARCHAR(100),
    status VARCHAR(20) DEFAULT 'ready_to_ship' CHECK (status IN ('ready_to_ship','shipped','in_transit','delivered','returned')),
    shipped_at TIMESTAMP,
    delivered_at TIMESTAMP
);

-- ======================================
--  TABLE: payouts
-- ======================================
CREATE TABLE IF NOT EXISTS payouts (
    payout_id BIGSERIAL PRIMARY KEY,
    seller_id BIGINT REFERENCES sellers(seller_id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','processed','failed')),
    transaction_date TIMESTAMP DEFAULT NOW(),
    reference_id VARCHAR(255)
);

-- ======================================
--  TABLE: seller_analytics (optional)
-- ======================================
CREATE TABLE IF NOT EXISTS seller_analytics (
    analytics_id BIGSERIAL PRIMARY KEY,
    seller_id BIGINT REFERENCES sellers(seller_id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_orders INT DEFAULT 0,
    total_sales DECIMAL(10,2) DEFAULT 0,
    refunds INT DEFAULT 0,
    net_earnings DECIMAL(10,2) DEFAULT 0
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_seller_id ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller_id ON orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_shipments_order_id ON shipments(order_id);
