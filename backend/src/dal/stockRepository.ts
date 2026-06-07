import Stock, { IStock } from '../models/stockModel';
import mongoose from 'mongoose';

export class StockRepository {
  /**
   * Retrieves the current (latest active) version of a stock holding.
   */
  async findLatest(userId: string, symbol: string): Promise<IStock | null> {
    return Stock.findOne({ 
      userId, 
      symbol, 
      validTo: null, 
      isDeleted: false 
    }).exec();
  }

  /**
   * Retrieves all current active stock holdings for a user.
   */
  async findAllLatestForUser(userId: string): Promise<IStock[]> {
    return Stock.find({ 
      userId, 
      validTo: null, 
      isDeleted: false 
    }).exec();
  }

  /**
   * Upserts a stock holding using Temporal Semantics (SCD Type 2).
   * It never mutates the existing record in-place. Instead, it expires the old record
   * and creates a new one.
   */
  async upsertStock(
    userId: string, 
    symbol: string, 
    newQuantity: number, 
    newAvgPrice: number,
    dataSourceId?: mongoose.Types.ObjectId
  ): Promise<IStock> {
    const now = new Date();
    
    // 1. Find the current active record
    const currentStock = await this.findLatest(userId, symbol);
    
    let newVersion = 1;

    // 2. If it exists, expire it
    if (currentStock) {
      currentStock.validTo = now;
      await currentStock.save();
      newVersion = currentStock.version + 1;
    }

    // 3. Create the new version
    const newStock = new Stock({
      userId,
      symbol,
      quantity: newQuantity,
      averagePrice: newAvgPrice,
      validFrom: now,
      validTo: null,
      version: newVersion,
      isDeleted: newQuantity === 0, // Soft delete if quantity reaches 0
      dataSourceId
    });

    return newStock.save();
  }

  /**
   * Soft deletes a stock holding (e.g., when completely sold off).
   */
  async deleteStock(userId: string, symbol: string, dataSourceId?: mongoose.Types.ObjectId): Promise<void> {
    await this.upsertStock(userId, symbol, 0, 0, dataSourceId);
  }
}
