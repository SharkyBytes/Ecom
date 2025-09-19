-- ======================================
-- SCHEMA + SAMPLE DATA
-- ======================================

-- Drop schema if needed (DEV only)
-- DROP SCHEMA public CASCADE;
-- CREATE SCHEMA public;

-- ========================
--  TABLE DEFINITIONS
-- ========================

CREATE TABLE IF NOT EXISTS addresses (
    address_id BIGSERIAL PRIMARY KEY,
    line1 VARCHAR(255) NOT NULL,
    line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(20) NOT NULL,
    country VARCHAR(50) NOT NULL
);

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

CREATE TABLE IF NOT EXISTS categories (
    category_id BIGSERIAL PRIMARY KEY,
    parent_id BIGINT REFERENCES categories(category_id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL
);

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

CREATE TABLE IF NOT EXISTS product_variants (
    variant_id BIGSERIAL PRIMARY KEY,
    product_id BIGINT REFERENCES products(product_id) ON DELETE CASCADE,
    sku VARCHAR(50) UNIQUE NOT NULL,
    attributes JSONB,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    stock_quantity INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active','inactive'))
);

CREATE TABLE IF NOT EXISTS orders (
    order_id BIGSERIAL PRIMARY KEY,
    buyer_id BIGINT,
    seller_id BIGINT REFERENCES sellers(seller_id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','confirmed','shipped','delivered','cancelled','returned')),
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending','paid','failed','refunded')),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
    order_item_id BIGSERIAL PRIMARY KEY,
    order_id BIGINT REFERENCES orders(order_id) ON DELETE CASCADE,
    product_id BIGINT REFERENCES products(product_id),
    variant_id BIGINT REFERENCES product_variants(variant_id),
    quantity INT NOT NULL CHECK (quantity > 0),
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0)
);

CREATE TABLE IF NOT EXISTS payouts (
    payout_id BIGSERIAL PRIMARY KEY,
    seller_id BIGINT REFERENCES sellers(seller_id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','processed','failed')),
    transaction_date TIMESTAMP DEFAULT NOW(),
    reference_id VARCHAR(255)
);

-- ========================
--  FAKE DATA INSERTS
-- ========================

-- Addresses
INSERT INTO addresses (line1, city, state, pincode, country)
VALUES 
('123 Market Street','Mumbai','Maharashtra','400001','India'),
('221B Baker Street','Delhi','Delhi','110001','India');

-- Sellers
INSERT INTO sellers (name, owner_name, email, phone, address_id, business_type, gst_number, kyc_status)
VALUES
('TechBazaar','Ramesh Sharma','techbazaar@example.com','9876543210',1,'company','27AABCT1234A1Z5','verified'),
('HomeKart','Priya Singh','homekart@example.com','9988776655',2,'individual',NULL,'verified');

-- Categories
INSERT INTO categories (name) VALUES ('Electronics'),('Home Appliances');

-- Products
INSERT INTO products (seller_id, name, description, category_id, price, status)
VALUES
(1,'Wireless Mouse','Ergonomic wireless mouse',1,799.00,'active'),
(1,'Mechanical Keyboard','RGB backlit keyboard',1,2499.00,'active'),
(2,'Mixer Grinder','500W Kitchen Mixer Grinder',2,3299.00,'active');

-- Product Variants
INSERT INTO product_variants (product_id, sku, attributes, price, stock_quantity)
VALUES
(1,'MOUSE-001','{"color":"black"}',799.00,50),
(2,'KEYBOARD-001','{"color":"white"}',2499.00,30),
(3,'MIXER-001','{"color":"red"}',3299.00,20);

-- Orders
INSERT INTO orders (buyer_id, seller_id, status, total_amount, payment_status)
VALUES
(101,1,'confirmed',3299.00,'paid'),
(102,2,'shipped',2499.00,'paid');

-- Order Items
INSERT INTO order_items (order_id, product_id, variant_id, quantity, price)
VALUES
(1,3,3,1,3299.00),
(2,2,2,1,2499.00);

-- Payouts
INSERT INTO payouts (seller_id, amount, status, reference_id)
VALUES
(1,3299.00,'processed','TXN123456'),
(2,2499.00,'pending','TXN987654');
