// server/test-db.js
import "./env.js";
import { pool, query } from "./db/db.js";

async function testDatabase() {
  try {
    console.log("Testing database connection...");
    
    // Test basic connection
    const result = await query("SELECT NOW() as current_time");
    console.log("Database connection successful:", result.rows[0].current_time);
    
    // Check if tables exist
    const tablesResult = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log("\nDatabase tables:");
    tablesResult.rows.forEach(row => {
      console.log(`- ${row.table_name}`);
    });
    
    // Count records in each table
    const tables = tablesResult.rows.map(row => row.table_name);
    
    console.log("\nRecord counts:");
    for (const table of tables) {
      const countResult = await query(`SELECT COUNT(*) FROM ${table}`);
      console.log(`- ${table}: ${countResult.rows[0].count} records`);
    }
    
    console.log("\nDatabase test completed successfully!");
  } catch (error) {
    console.error("Database test failed:", error);
  } finally {
    await pool.end();
  }
}

testDatabase();
