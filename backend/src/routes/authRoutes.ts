import express from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { User } from '../models/User';

const router = express.Router();

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Basic validation
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Please provide all required fields' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'User already exists with this email' 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user (without role)
    const user = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'fallback-secret-key' as jwt.Secret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '30d' } as SignOptions
    );

    // Return user info and token
    res.status(201).json({
      status: 'success',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to register user' 
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Please provide email and password' 
      });
    }

    // Find user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ 
        status: 'error', 
        message: 'Invalid credentials' 
      });
    }

    // Check password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ 
        status: 'error', 
        message: 'Invalid credentials' 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'fallback-secret-key' as jwt.Secret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '30d' } as SignOptions
    );

    // Return user info and token
    res.status(200).json({
      status: 'success',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to login' 
    });
  }
});

// Verify and refresh token
router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        status: 'error',
        message: 'Token is required'
      });
    }
    
    // Verify the token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'fallback-secret-key' as jwt.Secret
    ) as { id: string };
    
    // Get user data
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    // Generate a fresh token
    const newToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'fallback-secret-key' as jwt.Secret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '30d' } as SignOptions
    );
    
    res.status(200).json({
      status: 'success',
      token: newToken,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    
    // Check if error is jwt expired
    if ((error as Error).name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: 'Token has expired'
      });
    }
    
    res.status(401).json({
      status: 'error',
      message: 'Invalid token'
    });
  }
});

// Logout user (in JWT, this is typically handled client-side)
router.post('/logout', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Successfully logged out'
  });
});

export default router;
