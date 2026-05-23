import mongoose, { Schema, Document } from 'mongoose';

export interface IBalance extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  amount: number;
}

const balanceSchema: Schema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  amount: { type: Number, required: true, default: 0 },
});

const Balance = mongoose.model<IBalance>('Balance', balanceSchema);

export default Balance;