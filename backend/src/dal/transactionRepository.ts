import Transaction, { ITransaction } from '../models/transactionModel';

export class TransactionRepository {
  /**
   * Retrieves all transactions for a user.
   */
  async findAllForUser(userId: string): Promise<ITransaction[]> {
    return Transaction.find({ userId }).exec();
  }

  /**
   * Retrieves transactions for specific symbols within a date range.
   */
  async findFiltered(userId: string, symbols: string[], startDate: Date): Promise<ITransaction[]> {
    return Transaction.find({
      userId,
      symbol: { $in: symbols },
      date: { $gte: startDate }
    }).exec();
  }
}
