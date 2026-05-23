import request from 'supertest';
import express from 'express';
import { register, login } from '../auth/authController';
import AuthService from '../auth/authService';

jest.mock('../auth/authService');

const app = express();
app.use(express.json());
app.post('/api/auth/register', register);
app.post('/api/auth/login', login);

describe('Auth Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a user successfully', async () => {
      const mockUser = {
        name: 'John Doe',
        email: 'john@example.com',
        passHash: 'hashedpassword',
        role: 'user',
        strategy: 'strategy1'
      };

      (AuthService.register as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password',
          role: 'user',
          strategy: 'strategy1'
        });

      expect(response.status).toBe(200);
      expect(response.body.user).toEqual(mockUser);
      expect(response.body.message).toBe('User registered successfully');
    });

    it('should return 400 if user already exists', async () => {
      (AuthService.register as jest.Mock).mockRejectedValue(new Error('User already exists'));

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password',
          role: 'user',
          strategy: 'strategy1'
        });

      expect(response.status).toBe(400);
      expect(response.text).toBe('User already exists');
    });

    it('should return 500 if there is an error', async () => {
      (AuthService.register as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password',
          role: 'user',
          strategy: 'strategy1'
        });

      expect(response.status).toBe(500);
      expect(response.text).toBe('Database error');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login a user successfully', async () => {
      const mockToken = 'fake-jwt-token';
      (AuthService.login as jest.Mock).mockResolvedValue(mockToken);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john@example.com',
          password: 'password'
        });

      expect(response.status).toBe(200);
      expect(response.body.token).toBe(mockToken);
      expect(response.body.message).toBe('User logged in successfully');
    });

    it('should return 400 if login fails', async () => {
      (AuthService.login as jest.Mock).mockRejectedValue(new Error('Invalid email or password'));

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(400);
      expect(response.text).toBe('Invalid email or password');
    });
  });
});
