import mongoose from 'mongoose';

// Address schema for customer delivery addresses and owner restaurant location
const addressSchema = new mongoose.Schema({
  street: {
    type: String,
    required: true
  },
  area: {
    type: String,
    required: true
  },
  district: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  isDefault: {
    type: Boolean,
    default: false
  }
});

// Menu item schema for restaurant owners
const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  image: {
    type: String // URL to image
  }
});

// Activity log schema for tracking user activity
const activityLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: ['login', 'logout', 'profile_update', 'password_change', 'address_add', 'address_update', 'menu_update']
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  ipAddress: String,
  userAgent: String,
  location: String,
  device: String
});

// OTP schema for verification
const otpSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  isUsed: {
    type: Boolean,
    default: false
  }
});

const userSchema = new mongoose.Schema({
  userType: {
    type: String,
    enum: ['Admin', 'Owner', 'Customer'],
    required: true,
  },
  phone: {
    type: String,
    unique: true,
    sparse: true,
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
  },
  password: {
    type: String,
    required: true,
  },
  
  // OTP verification fields
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  phoneOtp: otpSchema,
  emailOtp: otpSchema,
  
  // Account status
  isActive: {
    type: Boolean,
    default: true
  },
  isDeactivated: {
    type: Boolean,
    default: false
  },
  deactivatedAt: Date,
  deactivationReason: String,
  
  // Referral system
  referralCode: {
    type: String,
    unique: true,
    sparse: true
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  referralCount: {
    type: Number,
    default: 0
  },
  referralRewards: [{
    type: {
      type: String,
      enum: ['discount', 'credit', 'free_delivery']
    },
    amount: Number,
    description: String,
    isUsed: {
      type: Boolean,
      default: false
    },
    expiresAt: Date,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Common profile fields
  name: {
    type: String,
    default: ''
  },
  
  // Customer specific fields
  deliveryAddresses: [addressSchema],
  preferredLanguage: {
    type: String,
    enum: ['English', 'Bengali'],
    default: 'English'
  },
  

  
  // Profile completion status
  isProfileComplete: {
    type: Boolean,
    default: false
  },
  
  // Activity logging
  activityLogs: [activityLogSchema],
  
  // Last login tracking
  lastLogin: {
    timestamp: Date,
    ipAddress: String,
    userAgent: String,
    location: String
  },
  
  // Remember me tokens
  rememberMeTokens: [{
    token: String,
    expiresAt: Date,
    device: String,
    ipAddress: String
  }]
}, { timestamps: true });

// Generate referral code before saving
userSchema.pre('save', function(next) {
  if (!this.referralCode) {
    this.referralCode = this.generateReferralCode();
  }
  next();
});

// Method to generate unique referral code
userSchema.methods.generateReferralCode = function() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Method to add activity log
userSchema.methods.addActivityLog = function(action, req) {
  const log = {
    action,
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    device: this.getDeviceInfo(req.get('User-Agent')),
    location: req.get('X-Forwarded-For') || req.ip
  };
  
  this.activityLogs.push(log);
  
  // Keep only last 50 activity logs
  if (this.activityLogs.length > 50) {
    this.activityLogs = this.activityLogs.slice(-50);
  }
};

// Method to get device info from user agent
userSchema.methods.getDeviceInfo = function(userAgent) {
  if (!userAgent) return 'Unknown';
  
  if (userAgent.includes('Mobile')) return 'Mobile';
  if (userAgent.includes('Tablet')) return 'Tablet';
  if (userAgent.includes('Windows')) return 'Desktop (Windows)';
  if (userAgent.includes('Mac')) return 'Desktop (Mac)';
  if (userAgent.includes('Linux')) return 'Desktop (Linux)';
  
  return 'Desktop';
};

// Method to add referral reward
userSchema.methods.addReferralReward = function(type, amount, description) {
  const reward = {
    type,
    amount,
    description,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  };
  
  this.referralRewards.push(reward);
};

const User = mongoose.model('User', userSchema);
export default User;