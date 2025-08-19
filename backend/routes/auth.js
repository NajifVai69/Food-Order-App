import express from 'express';
import { 
  registerUser, 
  loginUser, 
  logout, 
  sendPhoneOTP, 
  sendEmailOTPVerification, 
  verifyPhoneOTP, 
  verifyEmailOTP,
  getActivityLogs,
  deactivateAccount,
  deleteAccount,
  getReferralInfo,
  getAllOwners
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logout);

// OTP routes
router.post('/send-phone-otp', sendPhoneOTP);
router.post('/send-email-otp', sendEmailOTPVerification);
router.post('/verify-phone-otp', verifyPhoneOTP);
router.post('/verify-email-otp', verifyEmailOTP);

// Protected routes
router.get('/owners', protect, getAllOwners);

router.get('/activity-logs', protect, getActivityLogs);
router.post('/deactivate-account', protect, deactivateAccount);
router.post('/delete-account', protect, deleteAccount);
router.get('/referral-info', protect, getReferralInfo);

export default router;

