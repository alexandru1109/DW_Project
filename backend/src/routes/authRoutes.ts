import { Router } from 'express';
import authMiddleware from '../auth/authMiddleware';
import { 
  register, 
  login, 
  verify, 
  verifyOtp, 
  requestPasswordChange, 
  confirmPasswordChange 
} from '../auth/authController';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/verify/:token', verify);
router.post('/verify-otp', verifyOtp);
router.post('/request-password-change', requestPasswordChange);
router.post('/confirm-password-change', confirmPasswordChange);
router.get('/test', (req, res) => {
    res.send('Route /api/auth/test is working');
  });
  

export default router;
