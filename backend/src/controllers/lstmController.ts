import { Request, Response } from 'express';
import { getPrediction, shouldBuyStock } from '../services/lstmService';

export const predictStock = async (req: Request, res: Response) => {
    const { symbol } = req.body;
    try {
        const { prediction, historicalData } = await getPrediction(symbol);
        res.json({ prediction, historicalData });
    } catch (error: any) {
        console.error('Error in predictStock:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: error.message });
    }
};

export const shouldBuy = async (req: Request, res: Response) => {
    const { symbol } = req.body;
    try {
        const { prediction, lastClose, decision } = await shouldBuyStock(symbol);
        res.json({ prediction, lastClose, decision });
    } catch (error: any) {
        console.error('Error in shouldBuy:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: error.message });
    }
};
