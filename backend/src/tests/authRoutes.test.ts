import request from 'supertest';
import express from 'express';
import authRoutes from '../routes/authRoutes';
import * as authController from '../auth/authController';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

jest.mock('../auth/authController');

describe('Auth Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a user successfully', async () => {
      (authController.register as jest.Mock).mockImplementation((req, res) => {
        res.status(201).json({ message: 'User registered' });
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({ name: 'John Doe', email: 'john@example.com', password: 'password', role: 'user', strategy: 'strategy1' });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('User registered');
    });

    it('should return 400 if user already exists', async () => {
      (authController.register as jest.Mock).mockImplementation((req, res) => {
        res.status(400).json({ message: 'User already exists' });
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({ name: 'John Doe', email: 'john@example.com', password: 'password', role: 'user', strategy: 'strategy1' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('User already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login a user successfully', async () => {
      (authController.login as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json({ token: 'fake-jwt-token', message: 'User logged in successfully' });
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'john@example.com', password: 'password' });

      expect(response.status).toBe(200);
      expect(response.body.token).toBe('fake-jwt-token');
      expect(response.body.message).toBe('User logged in successfully');
    });

    it('should return 400 for invalid email or password', async () => {
      (authController.login as jest.Mock).mockImplementation((req, res) => {
        res.status(400).json({ message: 'Invalid email or password' });
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'john@example.com', password: 'wrongpassword' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid email or password');
    });
  });
});
