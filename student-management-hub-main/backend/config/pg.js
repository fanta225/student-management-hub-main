import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  user: process.env.PGUSER || 'postgres',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'studen_check_monday_afternoon',
  password: process.env.PGPASSWORD || '1234',
  port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
});

export default pool;
