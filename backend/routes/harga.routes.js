import { Router } from 'express';
import { listHarga, addHarga, updateHarga, deleteHarga, toggleStatus } from '../controllers/harga.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', authenticate, listHarga);
router.post('/', authenticate, addHarga);
router.put('/:id', authenticate, updateHarga);
router.delete('/:id', authenticate, deleteHarga);
router.post('/toggle-status', authenticate, toggleStatus);

export default router;
