-- First create tables without foreign key constraints
CREATE TABLE users (
  id uuid PRIMARY KEY,
  name text,
  city bigint,
  push_subscription jsonb, -- encrypted/opaque reference in production
  locale varchar(8),
  created_at timestamptz DEFAULT now()
);
CREATE INDEX idx_users_city ON users(city);

CREATE TABLE products (
  id uuid PRIMARY KEY,
  name text,
  category varchar(128),
  origin_zone bigint, -- hub / origin for returns
  current_price numeric(10,2),
  created_at timestamptz DEFAULT now()
);
CREATE INDEX idx_products_category ON products(category);

-- Now create orders table with foreign key constraints
CREATE TABLE orders (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id),
  product_id uuid NOT NULL REFERENCES products(id),
  status varchar(32) NOT NULL, -- 'active','cancelled','completed'
  price numeric(10,2) NOT NULL,
  shipping_pincode bigint,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_orders_status_updated_at ON orders(status, updated_at);


CREATE TABLE interests (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES users(id),
  product_id uuid NULL,
  category varchar(128) NOT NULL,
  city bigint NULL,
  last_seen_at timestamptz,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX idx_interests_category_city_lastseen ON interests(category, city, last_seen_at);


CREATE TABLE flash_deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  order_id uuid NOT NULL,
  product_id uuid NOT NULL,
  category varchar(128),
  city bigint,
  original_price numeric(10,2),
  return_cost numeric(10,2),
  cost_saved numeric(10,2),
  discount_amount numeric(10,2),  -- 0.75 * cost_saved
  discount_percent numeric(5,2),
  discounted_price numeric(10,2),
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz
);
CREATE INDEX idx_flash_deals_user_expires ON flash_deals(user_id, expires_at);


-- CREATE TABLE processed_messages (
--   message_id uuid PRIMARY KEY,
--   event_type varchar(64),
--   processed_at timestamptz DEFAULT now()
-- );


-- CREATE TABLE cost_model (
--   id serial PRIMARY KEY,
--   category varchar(128),
--   origin_zone varchar(64),
--   dest_zone varchar(64),
--   estimated_return_cost numeric(10,2),
--   handling_cost numeric(10,2),
--   updated_at timestamptz DEFAULT now()
-- );
-- CREATE INDEX idx_costmodel_cat_zone ON cost_model(category, origin_zone, dest_zone);
