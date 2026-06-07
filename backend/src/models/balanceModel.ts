import mongoose, { Schema, Document } from 'mongoose';

export interface IBalance extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  amount: number;
  // Temporal Semantics
  validFrom: Date;
  validTo: Date | null;
  version: number;
  isDeleted: boolean;
  // Provenance
  dataSourceId?: mongoose.Schema.Types.ObjectId;
}

const balanceSchema: Schema = new Schema({
  // Removed unique: true because we will have multiple temporal records for the same user
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true, default: 0 },
  
  validFrom: { type: Date, default: Date.now, required: true },
  validTo: { type: Date, default: null },
  version: { type: Number, default: 1, required: true },
  isDeleted: { type: Boolean, default: false, required: true },
  
  dataSourceId: { type: mongoose.Schema.Types.ObjectId, ref: 'DataSource' }
});

balanceSchema.index({ userId: 1, validTo: 1 });

const Balance = mongoose.model<IBalance>('Balance', balanceSchema);

export default Balance;
