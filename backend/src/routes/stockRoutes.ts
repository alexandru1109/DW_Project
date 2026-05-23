import { Router } from 'express';
import { getUserStocks } from '../controllers/stockController';
import authMiddleware from '../auth/authMiddleware';

const router = Router();

router.get('/get', authMiddleware, getUserStocks);

export default router;