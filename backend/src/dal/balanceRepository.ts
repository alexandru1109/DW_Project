import Balance, { IBalance } from '../models/balanceModel';
import mongoose from 'mongoose';

export class BalanceRepository {
  /**
   * Retrieves the current (latest active) version of a user's balance.
   */
  async findLatest(userId: string): Promise<IBalance | null> {
    return Balance.findOne({ 
      userId, 
      validTo: null, 
      isDeleted: false 
    }).exec();
  }

  /**
   * Upserts a balance using Temporal Semantics (SCD Type 2).
   */
  async updateBalance(
    userId: string, 
    newAmount: number,
    dataSourceId?: mongoose.Types.ObjectId
  ): Promise<IBalance> {
    const now = new Date();
    
    const currentBalance = await this.findLatest(userId);
    let newVersion = 1;

    if (currentBalance) {
      currentBalance.validTo = now;
      await currentBalance.save();
      newVersion = currentBalance.version + 1;
    }

    const newBalance = new Balance({
      userId,
      amount: newAmount,
      validFrom: now,
      validTo: null,
      version: newVersion,
      isDeleted: false,
      dataSourceId
    });

    return newBalance.save();
  }
}
