import { Router } from 'express';
import { addTransaction, getTransactionHistory } from '../controllers/transactionController';
import { getStockLogo } from '../controllers/marketController'
import authMiddleware from '../auth/authMiddleware';

const router = Router();

router.post('/add', authMiddleware, addTransaction);
router.post('/get', authMiddleware, getTransactionHistory);
router.get('/logo-get/:symbol', getStockLogo);

export default router;
