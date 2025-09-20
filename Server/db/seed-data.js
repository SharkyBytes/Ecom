// server/db/seed-data.js
import { v4 as uuidv4 } from 'uuid';
import { query, pool } from './db.js';
import dotenv from "dotenv";
import { fileURLToPath } from 'url';

dotenv.config();

async function seedData() {
  try {
    console.log('Starting to seed database with mock data...');
    
    // Create two users in different cities
    const user1Id = uuidv4();
    const user2Id = uuidv4();
    
    await query(
      `INSERT INTO users (id, name, city, locale) 
       VALUES ($1, $2, $3, $4), ($5, $6, $7, $8)`,
      [
        user1Id, 'John Doe', 400001, 'en-US',  // Mumbai
        user2Id, 'Jane Smith', 110001, 'en-IN'  // Delhi
      ]
    );
    console.log('Users created with IDs:', user1Id, user2Id);
    
    // Create two products in different categories
    const product1Id = uuidv4();
    const product2Id = uuidv4();
    
    await query(
      `INSERT INTO products (id, name, category, origin_zone, current_price) 
       VALUES ($1, $2, $3, $4, $5), ($6, $7, $8, $9, $10)`,
      [
        product1Id, 'Smartphone X', 'electronics', 400001, 15999.99,
        product2Id, 'Designer T-shirt', 'fashion', 110001, 1299.99
      ]
    );
    console.log('Products created with IDs:', product1Id, product2Id);
    
    // Create one active order
    const orderId = uuidv4();
    
    await query(
      `INSERT INTO orders (id, user_id, product_id, status, price, shipping_pincode, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
      [
        orderId, user1Id, product1Id, 'active', 15999.99, 400001
      ]
    );
    console.log('Order created with ID:', orderId);
    
    // Create interests
    await query(
      `INSERT INTO interests (id, user_id, product_id, category, city, last_seen_at, created_at) 
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW()), ($6, $7, NULL, $8, $9, NOW(), NOW())`,
      [
        uuidv4(), user2Id, product1Id, 'electronics', 110001, 
        uuidv4(), user1Id, 'fashion', 400001
      ]
    );
    console.log('Interests created');
    
    console.log('Mock data seeded successfully!');
    console.log('----------------------------------------');
    console.log('To test the cancellation flow:');
    console.log(`1. Use this order ID: ${orderId}`);
    console.log(`2. Call POST /api/cancel/${orderId}`);
    console.log('----------------------------------------');
    
    return {
      users: [
        { id: user1Id, name: 'John Doe', city: 400001 },
        { id: user2Id, name: 'Jane Smith', city: 110001 }
      ],
      products: [
        { id: product1Id, name: 'Smartphone X', category: 'electronics', price: 15999.99 },
        { id: product2Id, name: 'Designer T-shirt', category: 'fashion', price: 1299.99 }
      ],
      orders: [
        { id: orderId, userId: user1Id, productId: product1Id, status: 'active' }
      ]
    };
  } catch (err) {
    console.error('Error seeding data:', err);
    throw err;
  } finally {
    await pool.end();
  }
}

// Run if this file is executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seedData()
    .then(() => {
      console.log('Seeding completed');
      process.exit(0);
    })
    .catch(err => {
      console.error('Seeding failed:', err);
      process.exit(1);
    });
}

export default seedData;
