// Server/db/init-db.js
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { query, pool } from "./db.js"; // <-- relative path + extension

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function init() {
  try {
    const sqlPath = path.join(__dirname, "init.sql");
    const sql = await fs.readFile(sqlPath, "utf8");
    await query(sql);
    console.log("Database initialized.");
  } catch (err) {
    console.error("Init failed:", err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

init();
