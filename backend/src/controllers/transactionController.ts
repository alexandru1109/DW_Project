import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import Transaction from '../models/transactionModel';
import Balance from '../models/balanceModel';
import Stock from '../models/stockModel';
import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

export const addTransaction = async (req: Request, res: Response) => {
  if (!(req as any).user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  const userId = ((req as any).user as jwt.JwtPayload & { id: string }).id;
  const { type, quantity, price, date, symbol, strategy } = req.body;

  try {
    // Check if market is open
    const quote: any = await yahooFinance.quote(symbol);
    if (quote.marketState !== 'REGULAR') {
      return res.status(400).json({ message: 'Market is closed. Transactions are not allowed.' });
    }

    const balance = await Balance.findOne({ userId });
    if (!balance) {
      return res.status(404).json({ message: 'Balance not found' });
    }

    const transactionAmount = quantity * price;
    if (type === 'buy') {
      if (balance.amount < transactionAmount) {
        return res.status(400).json({ message: 'Insufficient balance' });
      }
      balance.amount -= transactionAmount;

      let stock = await Stock.findOne({ userId, symbol });
      if (stock) {
        const newTotalQuantity = stock.quantity + quantity;
        stock.averagePrice = (stock.averagePrice * stock.quantity + price * quantity) / newTotalQuantity;
        stock.quantity = newTotalQuantity;
      } else {
        stock = new Stock({
          userId,
          symbol,
          quantity,
          averagePrice: price,
        });
      }
      await stock.save();

    } else if (type === 'sell') {
      const stock = await Stock.findOne({ userId, symbol });
      if (!stock || stock.quantity < quantity) {
        return res.status(400).json({ message: 'Not enough stock to sell' });
      }
      stock.quantity -= quantity;
      balance.amount += transactionAmount;

      if (stock.quantity === 0) {
        await Stock.deleteOne({ _id: stock._id });
      } else {
        await stock.save();
      }

    } else {
      return res.status(400).json({ message: 'Invalid transaction type' });
    }

    await balance.save();

    const transaction = new Transaction({
      userId,
      type,
      quantity,
      price,
      date,
      symbol,
      strategy,
    });

    await transaction.save();

    res.status(201).json({
      message: 'Transaction added successfully',
      transaction,
      balance: balance.amount,
    });
  } catch (error) {
    console.error('Error adding transaction:', error);
    res.status(500).json({ message: 'Error adding transaction', error });
  }
};

export const getTransactionHistory = async (req: Request, res: Response) => {
  if (!(req as any).user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  const userId = ((req as any).user as jwt.JwtPayload & { id: string }).id;

  try {
    const transactions = await Transaction.find({ userId });
    console.log('Transactions:', transactions); 
    res.status(200).json({ transactions }); 
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    res.status(500).json({ message: 'Error fetching transaction history', error });
  }
};