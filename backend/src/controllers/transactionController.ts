import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import Transaction from '../models/transactionModel';
import YahooFinance from 'yahoo-finance2';
import { BalanceRepository } from '../dal/balanceRepository';
import { StockRepository } from '../dal/stockRepository';
import { DataSourceRepository } from '../dal/dataSourceRepository';

const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });
const balanceRepo = new BalanceRepository();
const stockRepo = new StockRepository();
const dataSourceRepo = new DataSourceRepository();

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

    // Provenance: Track where this data comes from
    const dataSource = await dataSourceRepo.getOrCreate('User Platform Input', 'System');

    const balance = await balanceRepo.findLatest(userId);
    if (!balance) {
      return res.status(404).json({ message: 'Balance not found' });
    }

    const transactionAmount = quantity * price;
    let newBalanceAmount = balance.amount;

    if (type === 'buy') {
      if (balance.amount < transactionAmount) {
        return res.status(400).json({ message: 'Insufficient balance' });
      }
      newBalanceAmount -= transactionAmount;

      const stock = await stockRepo.findLatest(userId, symbol);
      let newTotalQuantity = quantity;
      let newAvgPrice = price;

      if (stock) {
        newTotalQuantity = stock.quantity + quantity;
        newAvgPrice = (stock.averagePrice * stock.quantity + price * quantity) / newTotalQuantity;
      }
      
      // Upsert using temporal semantics (creates new version, expires old)
      await stockRepo.upsertStock(userId, symbol, newTotalQuantity, newAvgPrice, dataSource._id as any);

    } else if (type === 'sell') {
      const stock = await stockRepo.findLatest(userId, symbol);
      if (!stock || stock.quantity < quantity) {
        return res.status(400).json({ message: 'Not enough stock to sell' });
      }
      
      const newTotalQuantity = stock.quantity - quantity;
      newBalanceAmount += transactionAmount;

      if (newTotalQuantity === 0) {
        // Soft delete (expires current, creates new with isDeleted=true)
        await stockRepo.deleteStock(userId, symbol, dataSource._id as any);
      } else {
        await stockRepo.upsertStock(userId, symbol, newTotalQuantity, stock.averagePrice, dataSource._id as any);
      }

    } else {
      return res.status(400).json({ message: 'Invalid transaction type' });
    }

    // Update balance using temporal semantics
    await balanceRepo.updateBalance(userId, newBalanceAmount, dataSource._id as any);

    // Save transaction with provenance
    const transaction = new Transaction({
      userId,
      type,
      quantity,
      price,
      date,
      symbol,
      strategy,
      dataSourceId: dataSource._id as any
    });

    await transaction.save();

    res.status(201).json({
      message: 'Transaction added successfully',
      transaction,
      balance: newBalanceAmount,
    });
  } catch (error) {
    console.error('Error adding transaction:', error);
    res.status(500).json({ message: 'Error adding transaction', error });
  }
};

import { TransactionRepository } from '../dal/transactionRepository';
const transactionRepo = new TransactionRepository();

export const getTransactionHistory = async (req: Request, res: Response) => {
  if (!(req as any).user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  const userId = ((req as any).user as jwt.JwtPayload & { id: string }).id;

  try {
    const transactions = await transactionRepo.findAllForUser(userId);
    console.log('Transactions:', transactions); 
    res.status(200).json({ transactions }); 
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    res.status(500).json({ message: 'Error fetching transaction history', error });
  }
};
