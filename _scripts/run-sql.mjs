import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import pkg from "pg";

const { Client } = pkg;

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const files = process.argv.slice(2);
if (files.length === 0) {
  console.error("Usage: node run-sql.mjs <sql-file> [<sql-file>...]");
  process.exit(1);
}

const connectionString = process.env.PG_URL;
if (!connectionString) {
  console.error("Set PG_URL env var");
  process.exit(1);
}

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

await client.connect();
console.log("Connected to Postgres.");

for (const f of files) {
  const path = join(root, f);
  console.log(`\n=== Running ${f} ===`);
  const sql = readFileSync(path, "utf-8");
  try {
    await client.query(sql);
    console.log(`✓ OK`);
  } catch (err) {
    console.error(`✗ ERROR running ${f}:`, err.message);
    process.exit(1);
  }
}

await client.end();
console.log("\nDone.");
