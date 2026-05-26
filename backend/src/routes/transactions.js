const express = require('express');
const router = express.Router();
const { pool } = require('../db');

router.get('/', async (req, res) => {
  try {
    const { month, year, type } = req.query;
    let query = 'SELECT * FROM transactions WHERE 1=1';
    const params = [];
    if (month && year) { query += ' AND MONTH(date)=? AND YEAR(date)=?'; params.push(month, year); }
    if (type) { query += ' AND type=?'; params.push(type); }
    query += ' ORDER BY date DESC, created_at DESC';
    const [rows] = await pool.execute(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/summary', async (req, res) => {
  try {
    const { month, year } = req.query;
    let where = '';
    const params = [];
    if (month && year) { where = "WHERE MONTH(date)=? AND YEAR(date)=? AND type != 'transfer'"; params.push(month, year); }
    else { where = "WHERE type != 'transfer'"; }
    const [rows] = await pool.execute(
      `SELECT
        SUM(CASE WHEN type='income'  THEN amount ELSE 0 END) AS total_income,
        SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) AS total_expense,
        COUNT(*) AS count
       FROM transactions ${where}`,
      params
    );
    const { total_income, total_expense, count } = rows[0];
    res.json({
      income:  parseFloat(total_income)  || 0,
      expense: parseFloat(total_expense) || 0,
      balance: (parseFloat(total_income) || 0) - (parseFloat(total_expense) || 0),
      count,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { type, amount, category, description, payment_method, card_name, to_account, date } = req.body;
    if (!type || !amount || !date) return res.status(400).json({ error: 'type, amount y date requeridos' });

    const isTransfer = type === 'transfer';
    if (isTransfer && !to_account) return res.status(400).json({ error: 'to_account requerido para transferencias' });
    if (!isTransfer && !category) return res.status(400).json({ error: 'category requerido' });

    const method = payment_method || 'efectivo';
    const card   = method === 'tarjeta' ? (card_name || null) : null;
    const cat    = isTransfer ? 'Transferencia' : category;
    const dest   = isTransfer ? to_account : null;

    const [result] = await pool.execute(
      `INSERT INTO transactions
        (type, amount, category, description, payment_method, card_name, to_account, date)
       VALUES (?,?,?,?,?,?,?,?)`,
      [type, parseFloat(amount), cat, description || '', method, card, dest, date]
    );
    const [rows] = await pool.execute('SELECT * FROM transactions WHERE id=?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.execute('DELETE FROM transactions WHERE id=?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'No encontrado' });
    res.json({ deleted: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
