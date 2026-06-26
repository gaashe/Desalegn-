import { Pool, PoolConfig } from "pg";
import dotenv from "dotenv";

dotenv.config();

const poolConfig: PoolConfig = {
  connectionString: process.env.DATABASE_URL,
  min: parseInt(process.env.DB_POOL_MIN || "2", 10),
  max: parseInt(process.env.DB_POOL_MAX || "10", 10),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
};

const pool = new Pool(poolConfig);

pool.on("error", (err) => {
  console.error("Unexpected error on idle database client", err);
  process.exit(-1);
});

export default pool;
