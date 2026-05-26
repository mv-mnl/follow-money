const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  database: process.env.DB_NAME || 'followmoney',
  user: process.env.DB_USER || 'followmoney',
  password: process.env.DB_PASSWORD || '',
  waitForConnections: true,
  connectionLimit: 10,
});

async function initDB() {
  const conn = await pool.getConnection();
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      type ENUM('income', 'expense') NOT NULL,
      amount DECIMAL(10, 2) NOT NULL,
      category VARCHAR(100) NOT NULL,
      description VARCHAR(255) DEFAULT '',
      date DATE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  conn.release();
}

module.exports = { pool, initDB };
