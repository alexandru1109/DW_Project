import mongoose, { Schema, Document } from 'mongoose';

export interface IStock extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  symbol: string;
  quantity: number;
  averagePrice: number;
  // Temporal Semantics
  validFrom: Date;
  validTo: Date | null;
  version: number;
  isDeleted: boolean;
  // Provenance
  dataSourceId?: mongoose.Schema.Types.ObjectId;
}

const stockSchema: Schema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  symbol: { type: String, required: true },
  quantity: { type: Number, required: true },
  averagePrice: { type: Number, required: true },
  
  validFrom: { type: Date, default: Date.now, required: true },
  validTo: { type: Date, default: null },
  version: { type: Number, default: 1, required: true },
  isDeleted: { type: Boolean, default: false, required: true },
  
  dataSourceId: { type: mongoose.Schema.Types.ObjectId, ref: 'DataSource' }
});

// Index for efficient temporal queries (finding the latest active version)
stockSchema.index({ userId: 1, symbol: 1, validTo: 1 });

const Stock = mongoose.model<IStock>('Stock', stockSchema);

export default Stock;
