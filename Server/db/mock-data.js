// server/db/mock-data.js
import { v4 as uuidv4 } from 'uuid';
import { query, pool } from './db.js';

// Fixed UUIDs for consistent testing
const USERS = {
  MUMBAI_USER: '11111111-1111-1111-1111-111111111111',
  DELHI_USER: '22222222-2222-2222-2222-222222222222',
  BANGALORE_USER: '33333333-3333-3333-3333-333333333333'
};

const PRODUCTS = {
  COTTON_KURTI_BLUE: '44444444-4444-4444-4444-444444444444',
  COTTON_KURTI_RED: '55555555-5555-5555-5555-555555555555',
  COTTON_KURTI_GREEN: '66666666-6666-6666-6666-666666666666'
};

const ORDERS = {
  ACTIVE_ORDER: '77777777-7777-7777-7777-777777777777'
};

const INTERESTS = {
  DELHI_USER_KURTI: '88888888-8888-8888-8888-888888888888',
  BANGALORE_USER_KURTI: '99999999-9999-9999-9999-999999999999'
};

// Shipping pincodes for major cities
const PINCODES = {
  MUMBAI: 400001,
  DELHI: 110001,
  BANGALORE: 560001
};

async function seedMockData() {
  try {
    console.log('Seeding mock data...');
    
    // Create users in different cities
    await query(
      `INSERT INTO users (id, name, city, locale) 
       VALUES ($1, $2, $3, $4), ($5, $6, $7, $8), ($9, $10, $11, $12)
       ON CONFLICT (id) DO NOTHING`,
      [
        USERS.MUMBAI_USER, 'Priya Sharma', PINCODES.MUMBAI, 'en-IN',
        USERS.DELHI_USER, 'Neha Singh', PINCODES.DELHI, 'en-IN',
        USERS.BANGALORE_USER, 'Kavita Patel', PINCODES.BANGALORE, 'en-IN'
      ]
    );
    console.log('Users created or already exist');
    
    // Create products - cotton kurtis in different colors
    await query(
      `INSERT INTO products (id, name, category, origin_zone, current_price) 
       VALUES ($1, $2, $3, $4, $5), ($6, $7, $8, $9, $10), ($11, $12, $13, $14, $15)
       ON CONFLICT (id) DO NOTHING`,
      [
        PRODUCTS.COTTON_KURTI_BLUE, 'Cotton Kurti Blue', 'women_clothing', PINCODES.DELHI, 899.99,
        PRODUCTS.COTTON_KURTI_RED, 'Cotton Kurti Red', 'women_clothing', PINCODES.MUMBAI, 799.99,
        PRODUCTS.COTTON_KURTI_GREEN, 'Cotton Kurti Green', 'women_clothing', PINCODES.BANGALORE, 999.99
      ]
    );
    console.log('Products created or already exist');
    
    // Create one active order - shipping from Delhi to Mumbai
    await query(
      `INSERT INTO orders (id, user_id, product_id, status, price, shipping_pincode) 
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO UPDATE SET 
         status = 'active',
         updated_at = NOW()`,
      [
        ORDERS.ACTIVE_ORDER, 
        USERS.MUMBAI_USER,  // Mumbai user ordered
        PRODUCTS.COTTON_KURTI_BLUE, // Blue kurti from Delhi
        'active', 
        899.99, 
        PINCODES.DELHI // Currently in Delhi (origin location)
      ]
    );
    console.log('Order created or updated to active status');
    
    // Create interests - Delhi and Bangalore users interested in kurtis
    await query(
      `INSERT INTO interests (id, user_id, product_id, category, city, last_seen_at) 
       VALUES ($1, $2, $3, $4, $5, NOW()), ($6, $7, NULL, $8, $9, NOW())
       ON CONFLICT (id) DO UPDATE SET last_seen_at = NOW()`,
      [
        INTERESTS.DELHI_USER_KURTI, 
        USERS.DELHI_USER, // Delhi user
        PRODUCTS.COTTON_KURTI_BLUE, // interested in blue kurti
        'women_clothing', 
        PINCODES.DELHI,
        
        INTERESTS.BANGALORE_USER_KURTI,
        USERS.BANGALORE_USER, // Bangalore user
        'women_clothing', // interested in women's clothing category
        PINCODES.BANGALORE
      ]
    );
    console.log('Interests created or updated');
    
    console.log('Mock data seeded successfully!');
    console.log('----------------------------------------');
    console.log('To test the cancellation flow:');
    console.log(`1. Use this order ID: ${ORDERS.ACTIVE_ORDER}`);
    console.log(`2. Call POST /api/cancel/${ORDERS.ACTIVE_ORDER}`);
    console.log('----------------------------------------');
    
    return {
      users: USERS,
      products: PRODUCTS,
      orders: ORDERS,
      interests: INTERESTS,
      pincodes: PINCODES
    };
  } catch (err) {
    console.error('Error seeding mock data:', err);
    throw err;
  }
}

// Export constants for use in other files
export {
  USERS,
  PRODUCTS,
  ORDERS,
  INTERESTS,
  PINCODES,
  seedMockData
};
