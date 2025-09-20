// server/setup-db.js
import { Pool } from 'pg';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse the DATABASE_URL to get components
const parseDbUrl = (url) => {
  const regex = /postgres:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(\w+)/;
  const match = url.match(regex);
  if (!match) {
    throw new Error('Invalid DATABASE_URL format');
  }
  return {
    user: match[1],
    password: match[2],
    host: match[3],
    port: match[4],
    database: match[5]
  };
};

async function setupDatabase() {
  let postgresPool = null;
  let appPool = null;
  
  try {
    console.log('Starting database setup...');
    const dbConfig = parseDbUrl(process.env.DATABASE_URL);
    
    // 1. Connect to default postgres database
    postgresPool = new Pool({
      user: dbConfig.user,
      password: dbConfig.password,
      host: dbConfig.host,
      port: dbConfig.port,
      database: 'postgres' // Connect to default database
    });
    
    console.log(`Checking if database "${dbConfig.database}" exists...`);
    
    // 2. Check if database exists
    const checkResult = await postgresPool.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [dbConfig.database]
    );
    
    if (checkResult.rowCount === 0) {
      console.log(`Database "${dbConfig.database}" does not exist. Creating it now...`);
      
      // 3. Create the database
      await postgresPool.query(`CREATE DATABASE ${dbConfig.database}`);
      console.log(`Database "${dbConfig.database}" created successfully!`);
    } else {
      console.log(`Database "${dbConfig.database}" already exists.`);
    }
    
    // 4. Connect to our application database
    appPool = new Pool({
      connectionString: process.env.DATABASE_URL
    });
    
    // 5. Initialize schema
    console.log('Initializing database schema...');
    const sqlPath = path.join(__dirname, 'db', 'init.sql');
    const sql = await fs.readFile(sqlPath, 'utf8');
    
    await appPool.query(sql);
    console.log('Database schema initialized successfully!');
    
    // 6. Seed data
    console.log('Seeding database with mock data...');
    
    // Create two users in different cities
    const user1Id = '11111111-1111-1111-1111-111111111111';
    const user2Id = '22222222-2222-2222-2222-222222222222';
    
    await appPool.query(
      `INSERT INTO users (id, name, city, locale) 
       VALUES ($1, $2, $3, $4), ($5, $6, $7, $8)
       ON CONFLICT (id) DO NOTHING`,
      [
        user1Id, 'John Doe', 400001, 'en-US',  // Mumbai
        user2Id, 'Jane Smith', 110001, 'en-IN'  // Delhi
      ]
    );
    console.log('Users created');
    
    // Create two products in different categories
    const product1Id = '33333333-3333-3333-3333-333333333333';
    const product2Id = '44444444-4444-4444-4444-444444444444';
    
    await appPool.query(
      `INSERT INTO products (id, name, category, origin_zone, current_price) 
       VALUES ($1, $2, $3, $4, $5), ($6, $7, $8, $9, $10)
       ON CONFLICT (id) DO NOTHING`,
      [
        product1Id, 'Smartphone X', 'electronics', 400001, 15999.99,
        product2Id, 'Designer T-shirt', 'fashion', 110001, 1299.99
      ]
    );
    console.log('Products created');
    
    // Create one active order
    const orderId = '55555555-5555-5555-5555-555555555555';
    
    await appPool.query(
      `INSERT INTO orders (id, user_id, product_id, status, price, shipping_pincode) 
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO NOTHING`,
      [
        orderId, user1Id, product1Id, 'active', 15999.99, 400001
      ]
    );
    console.log('Order created');
    
    // Create interests
    await appPool.query(
      `INSERT INTO interests (id, user_id, product_id, category, city, last_seen_at) 
       VALUES ($1, $2, $3, $4, $5, NOW()), ($6, $7, NULL, $8, $9, NOW())
       ON CONFLICT (id) DO NOTHING`,
      [
        '66666666-6666-6666-6666-666666666666', user2Id, product1Id, 'electronics', 110001, 
        '77777777-7777-7777-7777-777777777777', user1Id, 'fashion', 400001
      ]
    );
    console.log('Interests created');
    
    console.log('Mock data seeded successfully!');
    console.log('----------------------------------------');
    console.log('To test the cancellation flow:');
    console.log(`1. Use this order ID: ${orderId}`);
    console.log(`2. Call POST /api/cancel/${orderId}`);
    console.log('----------------------------------------');
    
    console.log('Database setup completed successfully!');
    return true;
  } catch (error) {
    console.error('Database setup failed:', error);
    return false;
  } finally {
    if (postgresPool) await postgresPool.end();
    if (appPool) await appPool.end();
  }
}

// Run if this file is executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  setupDatabase()
    .then(success => {
      process.exit(success ? 0 : 1);
    });
}

export default setupDatabase;
