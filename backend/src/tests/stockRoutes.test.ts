import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import stockRoutes from '../routes/stockRoutes';
import Market from '../models/stockModel';
import alphaVantageService from '../alphaVantageService';

const app = express();
app.use(express.json());
app.use('/api/stocks', stockRoutes);

jest.mock('../alphaVantageService');

describe('Stock Routes', () => {
  let server: any;
  const mockStock = {
    symbol: 'AAPL',
    history: [{ date: '2023-01-01', open: 150, high: 155, low: 148, close: 153, volume: 100000 }],
    indicators: { sma: 150, ema: 152 },
  };

  beforeAll(async () => {
    const url = process.env.MONGODB_URI || `mongodb://127.0.0.1/stock_test`;
    await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true } as mongoose.ConnectOptions);
    server = app.listen(5001);
  }, 30000); // Increase the timeout to 30 seconds

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    server.close();
  }, 30000); // Increase the timeout to 30 seconds

  afterEach(async () => {
    await Market.deleteMany({});
    jest.clearAllMocks();
  });

  describe('POST /api/stocks', () => {
    it('should create new stock data', async () => {
      const response = await request(app)
        .post('/api/stocks')
        .send(mockStock);

      expect(response.status).toBe(201);
      expect(response.body.symbol).toBe(mockStock.symbol);
    }, 30000); // Increase the timeout to 30 seconds

    it('should return 500 if there is an error creating stock data', async () => {
      const response = await request(app)
        .post('/api/stocks')
        .send({});

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Error creating stock data');
    }, 30000); // Increase the timeout to 30 seconds
  });

  describe('GET /api/stocks/:symbol', () => {
    it('should fetch stock data by symbol from database', async () => {
      await Market.create(mockStock);

      const response = await request(app).get(`/api/stocks/${mockStock.symbol}`);

      expect(response.status).toBe(200);
      expect(response.body.symbol).toBe(mockStock.symbol);
    }, 30000); // Increase the timeout to 30 seconds

    it('should fetch stock data by symbol from Alpha Vantage if not in database', async () => {
      (alphaVantageService.getStockData as jest.Mock).mockResolvedValue(mockStock);

      const response = await request(app).get(`/api/stocks/${mockStock.symbol}`);

      expect(response.status).toBe(200);
      expect(response.body.symbol).toBe(mockStock.symbol);
    }, 30000); // Increase the timeout to 30 seconds

    it('should return 500 if stock data is not found', async () => {
      (alphaVantageService.getStockData as jest.Mock).mockRejectedValue(new Error('Stock not found'));

      const response = await request(app).get('/api/stocks/INVALID');

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Error fetching stock data');
    }, 30000); // Increase the timeout to 30 seconds
  });

  describe('PUT /api/stocks/:symbol', () => {
    it('should update stock data by symbol', async () => {
      await Market.create(mockStock);
      const updatedData = { ...mockStock, history: [...mockStock.history, { date: '2023-01-02', open: 160, high: 165, low: 158, close: 163, volume: 120000 }] };

      const response = await request(app)
        .put(`/api/stocks/${mockStock.symbol}`)
        .send(updatedData);

      expect(response.status).toBe(200);
      expect(response.body.history).toHaveLength(2);
    }, 30000); // Increase the timeout to 30 seconds

    it('should return 500 if there is an error updating stock data', async () => {
      const response = await request(app)
        .put('/api/stocks/INVALID')
        .send({ history: ['updated'] });

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Error updating stock data');
    }, 30000); // Increase the timeout to 30 seconds
  });
});
