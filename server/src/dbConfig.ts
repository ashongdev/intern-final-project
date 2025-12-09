import { config } from "dotenv";
import { Pool } from "pg";
config({ quiet: true });

export const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
});
