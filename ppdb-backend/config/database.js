const mysql = require("mysql2/promise");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

// Buat pool koneksi — lebih efisien dari single connection
const pool = mysql.createPool({
  host:     process.env.DB_HOST,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port:     process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit:    10,
});

// Test koneksi saat server pertama jalan
pool.getConnection()
  .then((conn) => {
    console.log("✅ Database MySQL terhubung!");
    conn.release();
  })
  .catch((err) => {
    console.error("❌ Gagal koneksi database:", err.message);
  });

module.exports = pool;
