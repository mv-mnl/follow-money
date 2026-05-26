const express = require('express');
const cors = require('cors');
const { initDB } = require('./db');
const transactionsRouter = require('./routes/transactions');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/transactions', transactionsRouter);

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
