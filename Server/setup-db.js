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
    
    // 6. Seed data using the mock data module
    console.log('Seeding database with mock data...');
    
    // Import and run the mock data seeder
    const { seedMockData } = await import('./db/mock-data.js');
    const mockData = await seedMockData();
    
    console.log('----------------------------------------');
    console.log('To test the cancellation flow:');
    console.log(`1. Use this order ID: ${mockData.orders.ACTIVE_ORDER}`);
    console.log(`2. Call POST /api/cancel/${mockData.orders.ACTIVE_ORDER}`);
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
