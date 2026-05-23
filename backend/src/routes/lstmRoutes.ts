import { Router } from 'express';
import { predictStock, shouldBuy } from '../controllers/lstmController';

const router = Router();

router.post('/predict', predictStock);
router.post('/should_buy', shouldBuy);

export default router;
