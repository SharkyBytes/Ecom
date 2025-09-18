-- Custom ENUM types
CREATE TYPE business_type_enum AS ENUM ('individual', 'company');
CREATE TYPE kyc_status_enum AS ENUM ('pending', 'verified', 'rejected');
CREATE TYPE product_status_enum AS ENUM ('draft', 'active', 'inactive');
CREATE TYPE variant_status_enum AS ENUM ('active', 'inactive');
CREATE TYPE order_status_enum AS ENUM ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'returned');
CREATE TYPE payment_status_enum AS ENUM ('pending', 'paid', 'failed', 'refunded');
CREATE TYPE shipment_status_enum AS ENUM ('ready_to_ship', 'shipped', 'in_transit', 'delivered', 'returned');
CREATE TYPE payout_status_enum AS ENUM ('pending', 'processed', 'failed');

-- Table schema
CREATE TABLE addresses (
    address_id BIGSERIAL PRIMARY KEY,
    line1 VARCHAR(255) NOT NULL,
    line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(20) NOT NULL,
    country VARCHAR(50) NOT NULL
);

CREATE TABLE sellers ( 
    seller_id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    owner_name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    address_id BIGINT NOT NULL REFERENCES addresses(address_id) ON DELETE RESTRICT,
    business_type business_type_enum NOT NULL,
    gst_number VARCHAR(50),
    kyc_status kyc_status_enum NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE categories (
    category_id BIGSERIAL PRIMARY KEY,
    parent_id BIGINT REFERENCES categories(category_id) ON DELETE SET NULL, -- For nested categories
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE products (
    product_id BIGSERIAL PRIMARY KEY,
    seller_id BIGINT NOT NULL REFERENCES sellers(seller_id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category_id BIGINT REFERENCES categories(category_id) ON DELETE SET NULL,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    status product_status_enum NOT NULL DEFAULT 'draft',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE product_variants (
    variant_id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
    sku VARCHAR(50),
    attributes JSONB, -- e.g., { "color": "red", "size": "M" }
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    status variant_status_enum NOT NULL DEFAULT 'active',
    UNIQUE (product_id, sku)
);

CREATE TABLE inventory (
    inventory_id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL UNIQUE REFERENCES products(product_id) ON DELETE CASCADE,
    current_stock INT NOT NULL DEFAULT 0 CHECK (current_stock >= 0),
    reserved_stock INT NOT NULL DEFAULT 0 CHECK (reserved_stock >= 0),
    threshold_stock INT NOT NULL DEFAULT 0 CHECK (threshold_stock >= 0)
);

CREATE TABLE orders (
    order_id BIGSERIAL PRIMARY KEY,
    buyer_id BIGINT NOT NULL, -- References a separate (undefined) 'buyers' table
    seller_id BIGINT NOT NULL REFERENCES sellers(seller_id) ON DELETE RESTRICT,
    status order_status_enum NOT NULL DEFAULT 'pending',
    total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount >= 0),
    payment_status payment_status_enum NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE order_items (
    order_item_id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(product_id) ON DELETE RESTRICT,
    variant_id BIGINT REFERENCES product_variants(variant_id) ON DELETE RESTRICT,
    quantity INT NOT NULL CHECK (quantity > 0),
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0) -- Price at time of purchase
);

CREATE TABLE shipments (
    shipment_id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL UNIQUE REFERENCES orders(order_id) ON DELETE CASCADE,
    tracking_number VARCHAR(255),
    carrier VARCHAR(100),
    status shipment_status_enum NOT NULL DEFAULT 'ready_to_ship',
    shipped_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ
);

CREATE TABLE payouts (
    payout_id BIGSERIAL PRIMARY KEY,
    seller_id BIGINT NOT NULL REFERENCES sellers(seller_id) ON DELETE RESTRICT,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
    status payout_status_enum NOT NULL DEFAULT 'pending',
    transaction_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reference_id VARCHAR(255) -- Bank/UPI transaction reference
);