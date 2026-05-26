const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  database: process.env.DB_NAME || 'followmoney',
  user: process.env.DB_USER || 'followmoney',
  password: process.env.DB_PASSWORD || '',
  waitForConnections: true,
  connectionLimit: 10,
  dateStrings: true,
});

const DEFAULT_CATEGORIES = [
  { name: 'Salario',         type: 'income'  },
  { name: 'Freelance',       type: 'income'  },
  { name: 'Inversiones',     type: 'income'  },
  { name: 'Venta',           type: 'income'  },
  { name: 'Otros ingresos',  type: 'income'  },
  { name: 'Comida',          type: 'expense' },
  { name: 'Transporte',      type: 'expense' },
  { name: 'Vivienda',        type: 'expense' },
  { name: 'Salud',           type: 'expense' },
  { name: 'Entretenimiento', type: 'expense' },
  { name: 'Ropa',            type: 'expense' },
  { name: 'Servicios',       type: 'expense' },
  { name: 'Educación',       type: 'expense' },
  { name: 'Otros gastos',    type: 'expense' },
];

async function initDB() {
  const conn = await pool.getConnection();

  await conn.execute(`
    CREATE TABLE IF NOT EXISTS categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      type ENUM('income','expense') NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uq_cat (name, type)
    )
  `);

  await conn.execute(`
    CREATE TABLE IF NOT EXISTS cards (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await conn.execute(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      type ENUM('income','expense','transfer') NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      category VARCHAR(100) NOT NULL DEFAULT '',
      description VARCHAR(255) DEFAULT '',
      payment_method ENUM('efectivo','tarjeta') NOT NULL DEFAULT 'efectivo',
      card_name VARCHAR(100) DEFAULT NULL,
      to_account VARCHAR(100) DEFAULT NULL,
      date DATE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Migrations — safe, ignore duplicate column / type change errors
  for (const sql of [
    "ALTER TABLE transactions ADD COLUMN payment_method ENUM('efectivo','tarjeta') NOT NULL DEFAULT 'efectivo'",
    "ALTER TABLE transactions ADD COLUMN card_name VARCHAR(100) DEFAULT NULL",
    "ALTER TABLE transactions ADD COLUMN to_account VARCHAR(100) DEFAULT NULL",
    "ALTER TABLE transactions MODIFY COLUMN type ENUM('income','expense','transfer') NOT NULL",
    "ALTER TABLE transactions MODIFY COLUMN category VARCHAR(100) NOT NULL DEFAULT ''",
  ]) {
    try { await conn.execute(sql); } catch (_) {}
  }

  // Seed default categories
  const [[{ n }]] = await conn.execute('SELECT COUNT(*) AS n FROM categories');
  if (n === 0) {
    for (const { name, type } of DEFAULT_CATEGORIES) {
      await conn.execute('INSERT IGNORE INTO categories (name,type) VALUES (?,?)', [name, type]);
    }
  }

  conn.release();
}

module.exports = { pool, initDB };
