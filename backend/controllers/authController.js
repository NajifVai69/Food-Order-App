
import User from '../models/user.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const registerUser = async (req, res) => {
  try {
    const { userType, phone, email, password } = req.body;

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

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      userType,
      phone,
      email,
      password: hashedPassword,
    });

    await user.save();

    res.status(201).json({ message: 'User registered successfully' });

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
      },
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
// Add this logout function
const logout = (req, res) => {
  try {
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



export { registerUser, loginUser,logout };
