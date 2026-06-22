import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

import authRoutes from './api/routes/auth.routes.js';
import barangRoutes from './api/routes/barang.routes.js';
import keuanganRoutes from './api/routes/keuangan.routes.js';
import transaksiRoutes from './api/routes/transaksi.routes.js';
import hargaRoutes from './api/routes/harga.routes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/barang', barangRoutes);
app.use('/api/keuangan', keuanganRoutes);
app.use('/api/transaksi', transaksiRoutes);
app.use('/api/harga', hargaRoutes);

// Serve static frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

// Error handler
app.use((err, req, res, next) => {
  console.error('[server]', err.message);
  res.status(500).json({ message: 'Internal server error' });
});

// Local dev: start listening
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚑 Server running on http://localhost:${PORT}`);
  });
}

// Vercel serverless: export app
export default app;
