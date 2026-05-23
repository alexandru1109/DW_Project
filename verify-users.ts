import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Manual path to model to avoid complex imports if possible, but let's try importing directly
import User from './backend/src/models/userModel';

dotenv.config({ path: './backend/.env' });

async function run() {
  try {
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) throw new Error('MONGODB_URI not defined');
    await mongoose.connect(mongoURI);
    const result = await User.updateMany({}, { $set: { isVerified: true } });
    console.log(`Updated ${result.modifiedCount} users to verified.`);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
run();
