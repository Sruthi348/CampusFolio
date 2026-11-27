import express from 'express';
import {
  login,
  getMe,
  changePassword,
  forgotPassword,
  resetPassword,
  visitorRegister,
  visitorLogin
} from '../controllers/auth.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { authLimiter } from '../middleware/rateLimiter.middleware.js';

const router = express.Router();

router.post('/login', authLimiter, login);
router.post('/visitor/register', authLimiter, visitorRegister);
router.post('/visitor/login', authLimiter, visitorLogin);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);
router.get('/me', authenticateToken, getMe);
router.post('/change-password', authenticateToken, changePassword);

export default router;
