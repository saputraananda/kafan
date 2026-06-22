import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'naturech_putra',
  password: process.env.DB_PASS || 'naturechemsynergy@2024',
  database: process.env.DB_NAME || 'naturech_ambulance',
  waitForConnections: true,
  connectionLimit: 10,
  timezone: '+07:00',
});

export default pool;
