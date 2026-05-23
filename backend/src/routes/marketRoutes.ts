import { Router } from 'express';
import { getMarketSummary, getMarketSummary10, getMarketNews, getStockLogo, getCurrentStockPrice, searchSymbols, getStockHistory } from '../controllers/marketController';

const router = Router();

router.get('/market-summary', getMarketSummary);
router.get('/market-summary10', getMarketSummary10);
router.get('/market-news', getMarketNews);
router.get('/logo/:symbol', getStockLogo);
router.get('/price/:symbol', getCurrentStockPrice);
router.get('/search', searchSymbols);
router.get('/history/:symbol', getStockHistory);

export default router;
