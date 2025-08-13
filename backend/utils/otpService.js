// Simplified OTP service for development (no external dependencies)
// In production, you would integrate with actual SMS/Email services

// Generate OTP code
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Mock SMS OTP (for development)
export const sendSMSOTP = async (phoneNumber, otp) => {
  try {
    // In development, just log the OTP
    console.log(`📱 SMS OTP for ${phoneNumber}: ${otp}`);
    console.log(`💡 In production, this would be sent via SMS service`);
    
    return { success: true };
  } catch (error) {
    console.error('SMS sending error:', error);
    return { success: false, error: error.message };
  }
};

// Mock Email OTP (for development)
export const sendEmailOTP = async (email, otp) => {
  try {
    // In development, just log the OTP
    console.log(`📧 Email OTP for ${email}: ${otp}`);
    console.log(`💡 In production, this would be sent via email service`);
    
    return { success: true };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
};

// Verify OTP
export const verifyOTP = (storedOTP, inputOTP) => {
  if (!storedOTP || !inputOTP) return false;
  
  // Check if OTP is expired
  if (new Date() > storedOTP.expiresAt) {
    return { valid: false, reason: 'expired' };
  }
  
  // Check if OTP is already used
  if (storedOTP.isUsed) {
    return { valid: false, reason: 'already_used' };
  }
  
  // Check if OTP matches
  if (storedOTP.code !== inputOTP) {
    return { valid: false, reason: 'invalid' };
  }
  
  return { valid: true };
};

// Create OTP object
export const createOTP = () => {
  const code = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  
  return {
    code,
    expiresAt,
    isUsed: false
  };
};
