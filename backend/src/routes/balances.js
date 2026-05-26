const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// Computa saldo de una cuenta (nombre de cuenta = 'efectivo' | nombre de tarjeta)
// Ingreso  → suma si la cuenta es destino
// Gasto    → resta si la cuenta es origen
// Transfer → suma si es to_account, resta si es origen
function accountMatchSQL(alias) {
  return `(
    (${alias}.payment_method = 'efectivo' AND ? = 'efectivo') OR
    (${alias}.payment_method = 'tarjeta'  AND ${alias}.card_name = ?)
  )`;
}

router.get('/', async (req, res) => {
  try {
    const [cards] = await pool.execute('SELECT name FROM cards ORDER BY name');
    const accounts = ['efectivo', ...cards.map((c) => c.name)];

    const balances = await Promise.all(
      accounts.map(async (account) => {
        const [[row]] = await pool.execute(
          `SELECT COALESCE(SUM(
            CASE
              WHEN type = 'income'   AND (payment_method='efectivo' AND ?='efectivo' OR payment_method='tarjeta' AND card_name=?) THEN  amount
              WHEN type = 'expense'  AND (payment_method='efectivo' AND ?='efectivo' OR payment_method='tarjeta' AND card_name=?) THEN -amount
              WHEN type = 'transfer' AND to_account = ?                                                                           THEN  amount
              WHEN type = 'transfer' AND (payment_method='efectivo' AND ?='efectivo' OR payment_method='tarjeta' AND card_name=?) THEN -amount
              ELSE 0
            END
          ), 0) AS balance
          FROM transactions`,
          [account, account, account, account, account, account, account]
        );
        return { account, balance: parseFloat(row.balance) };
      })
    );

    res.json(balances);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
