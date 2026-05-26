const express = require('express');
const router = express.Router();
const { pool } = require('../db');

router.get('/', async (req, res) => {
  try {
    const { type } = req.query;
    let query = 'SELECT * FROM categories';
    const params = [];
    if (type) { query += ' WHERE type = ?'; params.push(type); }
    query += ' ORDER BY type, name';
    const [rows] = await pool.execute(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, type } = req.body;
    if (!name || !type) return res.status(400).json({ error: 'name y type requeridos' });
    const [result] = await pool.execute(
      'INSERT INTO categories (name, type) VALUES (?, ?)',
      [name.trim(), type]
    );
    res.status(201).json({ id: result.insertId, name: name.trim(), type });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Categoría ya existe' });
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.execute('DELETE FROM categories WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'No encontrado' });
    res.json({ deleted: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
