import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import transactionRoutes from '../routes/transactionRoutes';
import Transaction from '../models/transactionModel';

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json());
app.use('/api/transactions', transactionRoutes);

// Properly mock the authentication middleware
jest.mock('../auth/authMiddleware', () => jest.fn((req, res, next) => {
  if (req.headers.authorization) {
    (req as any).user = { id: '605c72ef2f7992313c444444' }; // Mock user ID
    next();
  } else {
    res.status(401).json({ message: 'User not authenticated' });
  }
}));

describe('Transaction Routes', () => {
  beforeAll(async () => {
    const url = process.env.MONGODB_URI || 'mongodb://127.0.0.1/transactions_test';
    await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as mongoose.ConnectOptions);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await Transaction.deleteMany({});
  });

  const mockTransaction = {
    userId: new mongoose.Types.ObjectId('605c72ef2f7992313c444444'),
    type: 'buy',
    quantity: 10,
    price: 150,
    date: new Date(),
    symbol: 'AAPL',
    strategy: 'strategy1',
  };

  describe('POST /api/transactions', () => {
    it('should add a new transaction', async () => {
      const response = await request(app)
        .post('/api/transactions')
        .set('Authorization', 'Bearer mockToken')
        .send(mockTransaction);

      console.log('POST Response:', response.body);

      expect(response.status).toBe(201);
      expect(response.body.transaction).toMatchObject({
        ...mockTransaction,
        date: mockTransaction.date.toISOString(),
        userId: '605c72ef2f7992313c444444'
      });
      expect(response.body.message).toBe('Transaction added successfully');
    });

    it('should return 401 if user is not authenticated', async () => {
      const response = await request(app)
        .post('/api/transactions')
        .send(mockTransaction);

      console.log('POST Response (not authenticated):', response.body);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('User not authenticated');
    });
  });

  describe('GET /api/transactions', () => {
    it('should fetch transaction history', async () => {
      const transaction = new Transaction(mockTransaction);
      await transaction.save();

      const response = await request(app)
        .get('/api/transactions')
        .set('Authorization', 'Bearer mockToken');

      console.log('GET Response:', response.body);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toMatchObject({
        ...mockTransaction,
        date: mockTransaction.date.toISOString(),
        userId: '605c72ef2f7992313c444444'
      });
    });

    it('should return 401 if user is not authenticated', async () => {
      const response = await request(app)
        .get('/api/transactions');

      console.log('GET Response (not authenticated):', response.body);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('User not authenticated');
    });
  });
});
