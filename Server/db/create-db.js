// server/db/create-db.js
import { Pool } from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

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

const createDatabase = async () => {
  try {
    const dbConfig = parseDbUrl(process.env.DATABASE_URL);
    
    // Connect to default postgres database to create our database
    const pool = new Pool({
      user: dbConfig.user,
      password: dbConfig.password,
      host: dbConfig.host,
      port: dbConfig.port,
      database: 'postgres' // Connect to default database
    });
    
    console.log(`Checking if database "${dbConfig.database}" exists...`);
    
    // Check if database exists
    const checkResult = await pool.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [dbConfig.database]
    );
    
    if (checkResult.rowCount === 0) {
      console.log(`Database "${dbConfig.database}" does not exist. Creating it now...`);
      
      // Create the database
      await pool.query(`CREATE DATABASE ${dbConfig.database}`);
      console.log(`Database "${dbConfig.database}" created successfully!`);
    } else {
      console.log(`Database "${dbConfig.database}" already exists.`);
    }
    
    await pool.end();
    
    console.log('Database setup completed.');
    return true;
  } catch (error) {
    console.error('Failed to create database:', error);
    return false;
  }
};

// Run if this file is executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  createDatabase()
    .then(success => {
      process.exit(success ? 0 : 1);
    });
}

export default createDatabase;
