const express = require('express');
const cors = require('cors');
const { initDB } = require('./db');
const transactionsRouter = require('./routes/transactions');
const categoriesRouter   = require('./routes/categories');
const cardsRouter        = require('./routes/cards');
const balancesRouter     = require('./routes/balances');
const analyticsRouter    = require('./routes/analytics');

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/transactions', transactionsRouter);
app.use('/api/categories',   categoriesRouter);
app.use('/api/cards',        cardsRouter);
app.use('/api/balances',     balancesRouter);
app.use('/api/analytics',   analyticsRouter);

app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

async function start() {
  try {
    await initDB();
    console.log('DB inicializada');
    app.listen(PORT, () => console.log(`Backend en puerto ${PORT}`));
  } catch (err) {
    console.error('Error al iniciar:', err);
    process.exit(1);
  }
}

start();
