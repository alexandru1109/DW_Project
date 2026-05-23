import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Stock from '../models/stockModel';
import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

const getYahooData = async (symbol: string) => {
  try {
    const data = await yahooFinance.quote(symbol);
    const currentPrice = data.regularMarketPrice;
    
    // Fallback logo generator
    const logo = `https://companiesmarketcap.com/img/company-logos/64/${symbol.toUpperCase()}.webp`;

    return {
      currentPrice: currentPrice || 0,
      logo: logo,
    };
  } catch (error) {
    console.error(`Error fetching data from Yahoo for symbol: ${symbol}`, error);
    return null;
  }
};

export const getUserStocks = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid or missing user ID' });
    }

    const stocks = await Stock.find({ userId }).exec();

    if (!stocks || stocks.length === 0) {
      return res.status(404).json({ message: 'No stocks found for this user' });
    }

    const filteredStocks = await Promise.all(
      stocks.map(async (stock) => {
        if (stock.quantity <= 0) {
          return null;
        }

        const yahooData = await getYahooData(stock.symbol);

        if (!yahooData) {
          return null;
        }

        return {
          symbol: stock.symbol,
          logo: yahooData.logo,
          currentPrice: yahooData.currentPrice,
          totalSpent: stock.quantity * stock.averagePrice,
          quantity: stock.quantity,
          averagePrice: stock.averagePrice
        };
      })
    );

    const validStocks = filteredStocks.filter((stock) => stock !== null);

    return res.status(200).json(validStocks);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
    return res.status(500).json({ message: 'Unknown server error' });
  }
};