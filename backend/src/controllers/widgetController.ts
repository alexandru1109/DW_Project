import { Request, Response } from 'express';
import axios from 'axios';

const STOCK_API_URL = 'https://finnhub.io/api/v1';
const STOCK_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;

export const getCustomWidgets = async (req: Request, res: Response) => {
    const { symbols } = req.body;

    try {
        const stockDataPromises = symbols.map((symbol: string) =>
            axios.get(`${STOCK_API_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${STOCK_API_KEY}`)
        );

        const stockDataResponses = await Promise.all(stockDataPromises);
        const stockData = stockDataResponses.map(response => response.data['Global Quote']);

        res.status(200).json(stockData);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching custom widgets', error });
    }
};
