import { Router } from 'express';
import { listKeuangan, addKeuangan, updateKeuangan, deleteKeuangan } from '../controllers/keuangan.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', authenticate, listKeuangan);
router.post('/', authenticate, addKeuangan);
router.put('/:id', authenticate, updateKeuangan);
router.delete('/:id', authenticate, deleteKeuangan);

export default router;
