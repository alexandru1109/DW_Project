import request from 'supertest';
import express from 'express';
import userRoutes from '../routes/userRoutes';
import * as userController from '../controllers/userController';
import authMiddleware from '../auth/authMiddleware';

const app = express();
app.use(express.json());
app.use('/api/users', userRoutes);

jest.mock('../controllers/userController');
jest.mock('../auth/authMiddleware', () => jest.fn((req, res, next) => {
  (req as any).user = { _id: '1' }; // Mock user ID
  next();
}));

describe('User Routes', () => {
  const mockUser = {
    _id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    passHash: 'hashedpassword',
    role: 'user',
    strategy: 'strategy1',
  };

  describe('PUT /api/users/profile', () => {
    it('should update user profile', async () => {
      (userController.updateUserProfile as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json(mockUser);
      });

      const response = await request(app)
        .put('/api/users/profile')
        .send({ name: 'Jane Doe' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUser);
    });

    it('should return 401 if user is not authenticated', async () => {
      (authMiddleware as jest.Mock).mockImplementationOnce((req, res, next) => {
        res.status(401).json({ message: 'User not authenticated' });
      });

      const response = await request(app)
        .put('/api/users/profile')
        .send({ name: 'Jane Doe' });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('User not authenticated');
    });

    it('should return 404 if user is not found', async () => {
      (userController.updateUserProfile as jest.Mock).mockImplementation((req, res) => {
        res.status(404).json({ message: 'User not found' });
      });

      const response = await request(app)
        .put('/api/users/profile')
        .send({ name: 'Jane Doe' });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('User not found');
    });

    it('should return 500 if there is an error updating profile', async () => {
      (userController.updateUserProfile as jest.Mock).mockImplementation((req, res) => {
        res.status(500).json({ message: 'Error updating user profile' });
      });

      const response = await request(app)
        .put('/api/users/profile')
        .send({ name: 'Jane Doe' });

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Error updating user profile');
    });
  });
});
