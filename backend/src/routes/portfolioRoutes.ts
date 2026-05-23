import { Router } from 'express';
import { getPortfolioGraphData } from '../controllers/portfolioController';
import authMiddleware from '../auth/authMiddleware';

const router = Router();

router.get('/portfolio-graph', authMiddleware, getPortfolioGraphData);

export default router;
