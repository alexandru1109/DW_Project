import { Request, Response } from 'express';
import { TransactionRepository } from '../dal/transactionRepository';
import moment from 'moment';

const transactionRepo = new TransactionRepository();

interface PortfolioData {
  symbol: string;
  quantity: number;
  avgPrice: number;
  totalInvested: number;
}

interface StockGraphData {
  symbol: string;
  data: {
    totalInvested: number[];
    avgPrice: number[];
    labels: string[];
  };
}

export const getPortfolioGraphData = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  if (!userId) {
    return res.status(400).json({ message: 'User ID not found' });
  }

  const mode = req.query.mode as string;
  if (!['week', 'month', 'year'].includes(mode)) {
    return res.status(400).json({ message: 'Invalid mode. Allowed values are: week, month, year' });
  }

  try {
    const now = moment();
    let startDate: moment.Moment;
    let interval: moment.unitOfTime.DurationConstructor;

    switch (mode) {
      case 'week':
        startDate = now.clone().subtract(1, 'week');
        interval = 'day';
        break;
      case 'month':
        startDate = now.clone().subtract(1, 'month');
        interval = 'day';
        break;
      case 'year':
        startDate = now.clone().subtract(1, 'year');
        interval = 'month';
        break;
      default:
        startDate = now.clone();
        interval = 'day';
    }

    // Fetch transactions and calculate current holdings
    const transactions = await transactionRepo.findAllForUser(userId);

    const currentHoldings: { [symbol: string]: { quantity: number; totalInvested: number } } = {};

    transactions.forEach(({ symbol, type, quantity, price }) => {
      if (!currentHoldings[symbol]) {
        currentHoldings[symbol] = { quantity: 0, totalInvested: 0 };
      }

      if (type === 'buy') {
        currentHoldings[symbol].quantity += quantity;
        currentHoldings[symbol].totalInvested += quantity * price;
      } else if (type === 'sell') {
        currentHoldings[symbol].quantity -= quantity;
        currentHoldings[symbol].totalInvested -= quantity * price;
      }
    });

    // Filter to include only stocks with positive holdings
    const symbols = Object.keys(currentHoldings).filter(
      symbol => currentHoldings[symbol].quantity > 0
    );

    // Fetch transactions within the date range for the filtered symbols
    const relevantTransactions = await transactionRepo.findFiltered(userId, symbols, startDate.toDate());

    const groupedData: { [symbol: string]: { labels: string[]; totalInvested: number[]; avgPrice: number[] } } = {};

    // Initialize data structure for each symbol
    symbols.forEach(symbol => {
      groupedData[symbol] = { labels: [], totalInvested: [], avgPrice: [] };
    });

    // Process transactions and aggregate data per interval
    for (let date = startDate.clone(); date.isBefore(now) || date.isSame(now, interval); date.add(1, interval)) {
      const currentDate = date.format('YYYY-MM-DD');

      symbols.forEach(symbol => {
        const symbolTransactions = relevantTransactions.filter(
          transaction =>
            transaction.symbol === symbol &&
            moment(transaction.date).startOf(interval).format('YYYY-MM-DD') === currentDate
        );

        const prevTotalInvested =
          groupedData[symbol].totalInvested[groupedData[symbol].totalInvested.length - 1] || 0;
        const prevQuantity =
          groupedData[symbol].avgPrice[groupedData[symbol].avgPrice.length - 1] || 0;

        let totalInvested = prevTotalInvested;
        let quantity = prevQuantity;

        symbolTransactions.forEach(({ type, quantity: txnQuantity, price }) => {
          if (type === 'buy') {
            totalInvested += txnQuantity * price;
            quantity += txnQuantity;
          } else if (type === 'sell') {
            totalInvested -= txnQuantity * price;
            quantity -= txnQuantity;
          }
        });

        groupedData[symbol].labels.push(currentDate);
        groupedData[symbol].totalInvested.push(totalInvested);
        groupedData[symbol].avgPrice.push(quantity > 0 ? totalInvested / quantity : 0);
      });
    }

    const graphData: StockGraphData[] = Object.keys(groupedData).map(symbol => ({
      symbol,
      data: groupedData[symbol],
    }));

    res.status(200).json(graphData);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching portfolio graph data', error });
  }
};
