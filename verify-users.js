const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: './backend/.env' });

// We can't easily import the model if it's TS, so let's define a temporary schema
const UserSchema = new mongoose.Schema({
  email: String,
  isVerified: Boolean
});

const User = mongoose.model('User', UserSchema);

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
