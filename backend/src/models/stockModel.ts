import mongoose, { Schema, Document } from 'mongoose';

export interface IStock extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  symbol: string;
  quantity: number;
  averagePrice: number;
}

const stockSchema: Schema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  symbol: { type: String, required: true },
  quantity: { type: Number, required: true },
  averagePrice: { type: Number, required: true },
});

const Stock = mongoose.model<IStock>('Stock', stockSchema);

export default Stock;
