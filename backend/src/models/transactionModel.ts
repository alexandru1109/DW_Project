import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  type: string;
  quantity: number;
  price: number;
  date: Date;
  symbol: string;
  strategy: string;
}

const transactionSchema: Schema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true }, 
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  symbol: { type: String, required: true },
  strategy: { type: String, required: true },
});

const Transaction = mongoose.model<ITransaction>('Transaction', transactionSchema);

export default Transaction;
