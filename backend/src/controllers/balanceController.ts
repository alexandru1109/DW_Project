import { Request, Response } from 'express';
import { BalanceRepository } from '../dal/balanceRepository';
import { DataSourceRepository } from '../dal/dataSourceRepository';

const balanceRepo = new BalanceRepository();
const dataSourceRepo = new DataSourceRepository();

export const getBalance = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  console.log('User ID:', userId);
  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated', balance: 0 });
  }

  try {
    const balance = await balanceRepo.findLatest(userId);
    if (!balance) {
      return res.status(404).json({ message: 'Balance not found', balance: 0 });
    }

    res.status(200).json({ balance: balance.amount });
  } catch (error) {
    console.error('Error fetching balance:', error);
    res.status(500).json({ message: 'Error fetching balance', balance: 0 });
  }
};

export const addBalance = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  console.log('User ID:', userId);
  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  const { amount } = req.body;

  if (amount <= 0) {
    return res.status(400).json({ message: 'Amount must be greater than zero' });
  }

  try {
    const dataSource = await dataSourceRepo.getOrCreate('User Deposit', 'System');
    const currentBalance = await balanceRepo.findLatest(userId);
    const newAmount = (currentBalance?.amount || 0) + amount;
    
    const updatedBalance = await balanceRepo.updateBalance(userId, newAmount, dataSource._id as any);

    res.status(200).json({ balance: updatedBalance.amount });
  } catch (error) {
    console.error('Error adding to balance:', error);
    res.status(500).json({ message: 'Error adding to balance', error });
  }
};

export const subtractBalance = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  console.log('User ID:', userId); 
  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  const { amount } = req.body;

  if (amount <= 0) {
    return res.status(400).json({ message: 'Amount must be greater than zero' });
  }

  try {
    const dataSource = await dataSourceRepo.getOrCreate('User Withdrawal', 'System');
    const currentBalance = await balanceRepo.findLatest(userId);

    if (!currentBalance) {
      return res.status(405).json({ message: 'Balance not found' });
    }

    if (currentBalance.amount < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    const newAmount = currentBalance.amount - amount;
    const updatedBalance = await balanceRepo.updateBalance(userId, newAmount, dataSource._id as any);

    res.status(200).json({ balance: updatedBalance.amount });
  } catch (error) {
    console.error('Error subtracting from balance:', error);
    res.status(500).json({ message: 'Error subtracting from balance', error });
  }
};
