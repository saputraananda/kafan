import { Router } from 'express';
import { listBarang, addBarang, updateBarang, deleteBarang, listPemakaian, addPemakaian, deletePemakaian, restockBarang } from '../controllers/barang.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', authenticate, listBarang);
router.post('/', authenticate, addBarang);
router.put('/:id', authenticate, updateBarang);
router.delete('/:id', authenticate, deleteBarang);
router.get('/pemakaian', authenticate, listPemakaian);
router.post('/pemakaian', authenticate, addPemakaian);
router.delete('/pemakaian/:id', authenticate, deletePemakaian);
router.post('/restock', authenticate, restockBarang);

export default router;
