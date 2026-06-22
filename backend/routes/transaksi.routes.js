import { Router } from 'express';
import { listTransaksi, getStats, getHargaOptions, addTransaksi, updateTransaksi, deleteTransaksi } from '../controllers/transaksi.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', authenticate, listTransaksi);
router.get('/stats', authenticate, getStats);
router.get('/harga-options', authenticate, getHargaOptions);
router.post('/', authenticate, addTransaksi);
router.put('/:id', authenticate, updateTransaksi);
router.delete('/:id', authenticate, deleteTransaksi);

export default router;
