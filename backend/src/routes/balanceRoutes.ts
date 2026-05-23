import { Router } from 'express';
import { getBalance, addBalance, subtractBalance } from '../controllers/balanceController';
import authMiddleware from '../auth/authMiddleware';

const router = Router();

router.get('/get', authMiddleware, getBalance);

router.post('/add', authMiddleware, addBalance);

router.post('/subtract', authMiddleware, subtractBalance);


export default router;
