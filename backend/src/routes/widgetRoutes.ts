import { Router } from 'express';
import { getCustomWidgets } from '../controllers/widgetController';
import authMiddleware from '../auth/authMiddleware';

const router = Router();

router.post('/custom-widgets', authMiddleware, getCustomWidgets);

export default router;
