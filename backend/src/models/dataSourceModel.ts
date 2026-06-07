import mongoose, { Schema, Document } from 'mongoose';

export interface IDataSource extends Document {
  name: string; // e.g., 'Yahoo Finance', 'User Input', 'Alpha Vantage'
  type: string; // e.g., 'API', 'Manual', 'System'
  createdAt: Date;
}

const dataSourceSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  type: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const DataSource = mongoose.model<IDataSource>('DataSource', dataSourceSchema);

export default DataSource;
