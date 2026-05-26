const express = require('express');
const router  = express.Router();
const { pool } = require('../db');

// Last N months income/expense
router.get('/monthly', async (req, res) => {
  try {
    const months = Math.min(parseInt(req.query.months) || 6, 24);
    const [rows] = await pool.execute(
      `SELECT
        YEAR(date)  AS yr,
        MONTH(date) AS mo,
        SUM(CASE WHEN type='income'  THEN amount ELSE 0 END) AS income,
        SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) AS expense
       FROM transactions
       WHERE type != 'transfer'
         AND date >= DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL ? MONTH), '%Y-%m-01')
       GROUP BY yr, mo ORDER BY yr, mo`,
      [months - 1]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Category breakdown
router.get('/categories', async (req, res) => {
  try {
    const { type = 'expense', period = 'month', year, month, date } = req.query;
    const [where, params] = buildPeriodWhere(type, period, { year, month, date });
    const [rows] = await pool.execute(
      `SELECT category, SUM(amount) AS total, COUNT(*) AS count
       FROM transactions WHERE ${where}
       GROUP BY category ORDER BY total DESC`,
      params
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Report grouped by category or detail
router.get('/report', async (req, res) => {
  try {
    const { period = 'month', year, month, date, groupBy = 'category' } = req.query;
    const [where, params] = buildPeriodWhere(null, period, { year, month, date });

    const query = groupBy === 'category'
      ? `SELECT type, category, SUM(amount) AS total, COUNT(*) AS count
         FROM transactions WHERE ${where}
         GROUP BY type, category ORDER BY type DESC, total DESC`
      : `SELECT * FROM transactions WHERE ${where} ORDER BY date DESC, created_at DESC`;

    const [rows] = await pool.execute(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function buildPeriodWhere(type, period, { year, month, date } = {}) {
  const conditions = [];
  const params = [];

  if (type) {
    conditions.push('type = ?');
    params.push(type);
  } else {
    conditions.push("type != 'transfer'");
  }

  const now = new Date();
  const y = parseInt(year) || now.getFullYear();
  const m = parseInt(month) || now.getMonth() + 1;
  const d = date || now.toISOString().split('T')[0];

  if (period === 'day') {
    conditions.push('date = ?');
    params.push(d);
  } else if (period === 'week') {
    const ref  = new Date(d + 'T12:00:00');
    const dow  = ref.getDay();
    const diff = dow === 0 ? 6 : dow - 1;
    const mon  = new Date(ref); mon.setDate(ref.getDate() - diff);
    const sun  = new Date(mon); sun.setDate(mon.getDate() + 6);
    conditions.push('date >= ? AND date <= ?');
    params.push(mon.toISOString().split('T')[0], sun.toISOString().split('T')[0]);
  } else if (period === 'month') {
    conditions.push('MONTH(date) = ? AND YEAR(date) = ?');
    params.push(m, y);
  } else if (period === 'year') {
    conditions.push('YEAR(date) = ?');
    params.push(y);
  }

  return [conditions.join(' AND '), params];
}

module.exports = router;
