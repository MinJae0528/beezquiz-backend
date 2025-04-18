// src/config/db.js
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASS     || '1234',
  database: process.env.DB_NAME     || 'beezquiz_db',
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
});

console.log('✅ MySQL pool created (promise API)');

export default pool;
