
import User from '../models/user.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendSMSOTP, sendEmailOTP, verifyOTP, createOTP } from '../utils/otpService.js';

// Send OTP for phone verification (optional)
const sendPhoneOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    // Check if user exists
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ message: 'User not found with this phone number' });
    }

    // Generate and send OTP
    const otp = createOTP();
    const smsResult = await sendSMSOTP(phone, otp.code);

    if (!smsResult.success) {
      return res.status(500).json({ message: 'Failed to send OTP' });
    }

    // Save OTP to user
    user.phoneOtp = otp;
    await user.save();

    res.json({ message: 'OTP sent successfully to your phone' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Send OTP for email verification (optional)
const sendEmailOTPVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found with this email' });
    }

    // Generate and send OTP
    const otp = createOTP();
    const emailResult = await sendEmailOTP(email, otp.code);

    if (!emailResult.success) {
      return res.status(500).json({ message: 'Failed to send OTP' });
    }

    // Save OTP to user
    user.emailOtp = otp;
    await user.save();

    res.json({ message: 'OTP sent successfully to your email' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Verify phone OTP (optional)
const verifyPhoneOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ message: 'Phone number and OTP are required' });
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const verification = verifyOTP(user.phoneOtp, otp);
    if (!verification.valid) {
      return res.status(400).json({ 
        message: verification.reason === 'expired' ? 'OTP has expired' : 
                verification.reason === 'already_used' ? 'OTP already used' : 'Invalid OTP' 
      });
    }

    // Mark OTP as used and verify phone
    user.phoneOtp.isUsed = true;
    user.isPhoneVerified = true;
    await user.save();

    res.json({ message: 'Phone number verified successfully' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Verify email OTP (optional)
const verifyEmailOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const verification = verifyOTP(user.emailOtp, otp);
    if (!verification.valid) {
      return res.status(400).json({ 
        message: verification.reason === 'expired' ? 'OTP has expired' : 
                verification.reason === 'already_used' ? 'OTP already used' : 'Invalid OTP' 
      });
    }

    // Mark OTP as used and verify email
    user.emailOtp.isUsed = true;
    user.isEmailVerified = true;
    await user.save();

    res.json({ message: 'Email verified successfully' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const registerUser = async (req, res) => {
  try {
    const { userType, phone, email, password, referralCode } = req.body;

    if (!userType || !password || (!phone && !email)) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if user exists with phone or email
    const existingUser = await User.findOne({
      $or: [{ phone }, { email }]
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this phone or email' });
    }

    // Handle referral code
    let referredBy = null;
    if (referralCode) {
      referredBy = await User.findOne({ referralCode });
      if (!referredBy) {
        return res.status(400).json({ message: 'Invalid referral code' });
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      userType,
      phone,
      email,
      password: hashedPassword,
      referredBy: referredBy?._id
    });

    await user.save();

    // Add referral reward to the referrer
    if (referredBy) {
      referredBy.referralCount += 1;
      referredBy.addReferralReward('discount', 100, `Referral reward for ${user.name || 'new user'}`);
      await referredBy.save();
    }

    // Auto-verify phone/email for development (optional)
    if (phone) {
      user.isPhoneVerified = true;
    }
    if (email) {
      user.isEmailVerified = true;
    }
    await user.save();

    res.status(201).json({ 
      message: 'User registered successfully!',
      referralCode: user.referralCode,
      user: {
        id: user._id,
        userType: user.userType,
        phone: user.phone,
        email: user.email,
        isPhoneVerified: user.isPhoneVerified,
        isEmailVerified: user.isEmailVerified
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const loginUser = async (req, res) => {
  try {
    const { identifier, password, rememberMe } = req.body; 
    // identifier = phone or email entered by user for login

    if (!identifier || !password) {
      return res.status(400).json({ message: 'Please provide phone/email and password' });
    }

    // Find user by phone or email
    const user = await User.findOne({
      $or: [{ phone: identifier }, { email: identifier }]
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if account is active
    if (!user.isActive || user.isDeactivated) {
      return res.status(400).json({ message: 'Account is deactivated. Please contact support.' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create JWT payload
    const payload = {
      id: user._id,
      userType: user.userType,
    };

    // Token expiration based on Remember Me
    const tokenExpiry = rememberMe ? '7d' : '1h'; 

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: tokenExpiry,
    });

    // Update last login and add activity log
    user.lastLogin = {
      timestamp: new Date(),
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      location: req.get('X-Forwarded-For') || req.ip
    };

    user.addActivityLog('login', req);
    await user.save();

    // Set token in HttpOnly cookie for security
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: rememberMe ? 7 * 24 * 60 * 60 * 1000 : 1 * 60 * 60 * 1000, // ms
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        userType: user.userType,
        phone: user.phone,
        email: user.email,
        name: user.name,
        isPhoneVerified: user.isPhoneVerified,
        isEmailVerified: user.isEmailVerified,
        referralCode: user.referralCode
      },
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const logout = async (req, res) => {
  try {
    // Add activity log
    if (req.user) {
      req.user.addActivityLog('logout', req);
      await req.user.save();
    }

    // Clear the HTTP-only cookie
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during logout' });
  }
};

// Get user activity logs
const getActivityLogs = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('activityLogs');
    res.json({ activityLogs: user.activityLogs || [] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Deactivate account
const deactivateAccount = async (req, res) => {
  try {
    const { reason } = req.body;
    
    const user = await User.findById(req.user.id);
    user.isActive = false;
    user.isDeactivated = true;
    user.deactivatedAt = new Date();
    user.deactivationReason = reason || 'User requested deactivation';
    
    user.addActivityLog('account_deactivated', req);
    await user.save();

    res.json({ message: 'Account deactivated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete account permanently
const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;
    
    const user = await User.findById(req.user.id);
    
    // Verify password before deletion
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    await User.findByIdAndDelete(req.user.id);
    
    // Clear cookie
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get referral information
const getReferralInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('referralCode referralCount referralRewards')
      .populate('referredBy', 'name phone email');
    
    res.json({
      referralCode: user.referralCode,
      referralCount: user.referralCount,
      referralRewards: user.referralRewards,
      referredBy: user.referredBy
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
// Get all users with userType 'Owner'
export const getAllOwners = async (req, res) => {
  try {
    // Optionally restrict to admin only:
    if (req.user.userType !== 'Admin') {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }
    const owners = await User.find({ userType: 'Owner' }, '_id name email');
    res.json({ owners });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export { 
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
};
