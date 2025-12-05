import { config } from "dotenv";
import { Pool } from "pg";
config();

export const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
});
