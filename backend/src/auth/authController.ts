import { Request, Response } from 'express';
import AuthService from '../auth/authService';

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, strategy } = req.body;
    console.log('Request body:', req.body);
    const user = await AuthService.register(name, email, password, role, strategy);
    res.send({ user, message: 'User registered successfully. Please check your email for the verification link.' });
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === 'User already exists') {
        res.status(400).send(error.message);
      } else {
        res.status(500).send(error.message);
      }
    } else {
      res.status(500).send('An unexpected error occurred');
    }
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    await AuthService.login(email, password);
    res.send({ message: 'OTP sent to your email' });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).send(error.message);
    } else {
      res.status(500).send('An unexpected error occurred');
    }
  }
};

export const verify = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    await AuthService.verifyUser(token);
    res.send({ message: 'Email verification successful' });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).send(error.message);
    } else {
      res.status(500).send('An unexpected error occurred');
    }
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;
    const token = await AuthService.verifyOtp(email, otp);
    res.send({ token, message: 'OTP verification successful' });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).send(error.message);
    } else {
      res.status(500).send('An unexpected error occurred');
    }
  }
};

export const requestPasswordChange = async (req: Request, res: Response) => {
  try {
    const { email, newPassword, confirmNewPassword } = req.body;

    if (newPassword !== confirmNewPassword) {
      return res.status(400).send('Passwords do not match');
    }

    await AuthService.requestPasswordChange(email, newPassword);
    res.send({ message: 'OTP sent to your email for password change confirmation' });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).send(error.message);
    } else {
      res.status(500).send('An unexpected error occurred');
    }
  }
};

export const confirmPasswordChange = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;
    await AuthService.confirmPasswordChange(email, otp);
    res.send({ message: 'Password has been successfully updated' });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).send(error.message);
    } else {
      res.status(500).send('An unexpected error occurred');
    }
  }
};