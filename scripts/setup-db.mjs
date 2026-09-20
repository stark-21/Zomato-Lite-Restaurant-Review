// Runs db/schema.sql then db/seed.sql against DATABASE_URL.
// Usage: npm run db:setup
import { readFile } from "node:fs/promises";
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("Missing DATABASE_URL. Put it in .env.local and try again.");
  process.exit(1);
}

const sql = neon(url);

for (const file of ["db/schema.sql", "db/seed.sql"]) {
  const statement = await readFile(file, "utf8");
  // Split on semicolons; skip empty chunks. Good enough for our two small files.
  const parts = statement.split(";").map((s) => s.trim()).filter(Boolean);
  for (const part of parts) {
    await sql.query(part);
  }
  console.log(`Applied ${file}`);
}

const restaurants = await sql.query(`SELECT * FROM restaurants ORDER BY id`);
const reviews = await sql.query(
  `SELECT id, restaurant_id, rating, comment, created_at FROM reviews ORDER BY created_at`
);
console.log("restaurants:", restaurants);
console.log("reviews:", reviews);
