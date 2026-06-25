import fs from "fs";
import path from "path";
import pool from "./pool";

async function migrate(): Promise<void> {
  const schemaPath = path.join(__dirname, "schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf-8");

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(schema);
    await client.query("COMMIT");
    console.error("Migration completed successfully");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Migration failed:", error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch(() => process.exit(1));
