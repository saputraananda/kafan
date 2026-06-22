import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

import authRoutes from './backend/routes/auth.routes.js';
import barangRoutes from './backend/routes/barang.routes.js';
import keuanganRoutes from './backend/routes/keuangan.routes.js';
import transaksiRoutes from './backend/routes/transaksi.routes.js';
import hargaRoutes from './backend/routes/harga.routes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/barang', barangRoutes);
app.use('/api/keuangan', keuanganRoutes);
app.use('/api/transaksi', transaksiRoutes);
app.use('/api/harga', hargaRoutes);

// Serve static frontend + SPA fallback (production & Vercel)
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

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
