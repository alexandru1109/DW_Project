import { createUser, getAllUsers, getUserById, updateUser, deleteUser } from '../services/userService';
import User, { IUser } from '../models/userModel';

jest.mock('../models/userModel'); 

describe('User Service', () => {
  const mockUser: Partial<IUser> = {
    _id: '1',
    name: 'testuser',
    email: 'test@example.com',
    passHash: 'hashedpassword',
    role: 'user',
    strategy: 'strategy1',
  };

  describe('createUser', () => {
    it('should create a new user', async () => {
      (User.prototype.save as jest.Mock).mockResolvedValue(mockUser);
      const newUser = await createUser(mockUser as IUser);
      expect(newUser).toEqual(mockUser);
    });
  });

  describe('getAllUsers', () => {
    it('should fetch all users', async () => {
      (User.find as jest.Mock).mockResolvedValue([mockUser]);
      const users = await getAllUsers();
      expect(users).toEqual([mockUser]);
    });
  });

  describe('getUserById', () => {
    it('should fetch a user by id', async () => {
      (User.findById as jest.Mock).mockResolvedValue(mockUser);
      const user = await getUserById('1');
      expect(user).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      (User.findById as jest.Mock).mockResolvedValue(null);
      const user = await getUserById('1');
      expect(user).toBeNull();
    });
  });

  describe('updateUser', () => {
    it('should update a user', async () => {
      const updatedUser = { ...mockUser, name: 'updatedUser' };
      (User.findByIdAndUpdate as jest.Mock).mockResolvedValue(updatedUser);
      const user = await updateUser('1', { name: 'updatedUser' });
      expect(user).toEqual(updatedUser);
    });

    it('should return null if user not found', async () => {
      (User.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);
      const user = await updateUser('1', { name: 'updatedUser' });
      expect(user).toBeNull();
    });
  });

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      (User.findByIdAndDelete as jest.Mock).mockResolvedValue(mockUser);
      const user = await deleteUser('1');
      expect(user).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      (User.findByIdAndDelete as jest.Mock).mockResolvedValue(null);
      const user = await deleteUser('1');
      expect(user).toBeNull();
    });
  });
});
