import express, { Request, Response } from 'express';
import { protect } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { userValidation } from '../validations/userValidation';
import { User } from '../models/User';
import mongoose from 'mongoose';

const router = express.Router();

// Protected routes - all user routes require authentication
router.use(protect);

// Get current user profile
router.get('/me', async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user?.id);
    
    if (!user) {
      return res.status(404).json({ 
        status: 'error',
        message: 'User not found' 
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          avatar: user.avatar,
          phone: user.phone,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      }
    });
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Failed to retrieve user profile' 
    });
  }
});

// Update current user profile
router.patch('/me', validate(userValidation.updateProfile), async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    // Filter out fields that shouldn't be updated
    // Removed role filtering since we don't use roles anymore
    const { password, ...updateData } = req.body;
    
    // Update user
    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!user) {
      return res.status(404).json({ 
        status: 'error',
        message: 'User not found' 
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          avatar: user.avatar,
          phone: user.phone,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      }
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Failed to update user profile' 
    });
  }
});

// Change password
router.patch('/change-password', async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        status: 'error',
        message: 'Current password and new password are required'
      });
    }
    
    // Get user with password
    const user = await User.findById(req.user?.id).select('+password');
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    // Check if current password is correct
    const isCorrectPassword = await (user as any).comparePassword(currentPassword);
    
    if (!isCorrectPassword) {
      return res.status(401).json({
        status: 'error',
        message: 'Current password is incorrect'
      });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    res.status(200).json({
      status: 'success',
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to change password'
    });
  }
});

// Delete current user (deactivate)
router.delete('/me', async (req: Request, res: Response) => {
  try {
    await User.findByIdAndUpdate(req.user?.id, { active: false });
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete user account'
    });
  }
});

// Remove admin-only routes section
// We'll convert some needed routes to be available to all authenticated users

// Get all users - now available to all authenticated users if needed
router.get('/', async (req: Request, res: Response) => {
  try {
    const users = await User.find();
    
    res.status(200).json({
      status: 'success',
      results: users.length,
      data: {
        users: users.map(user => ({
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          avatar: user.avatar,
          phone: user.phone,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }))
      }
    });
  } catch (error) {
    console.error('Error getting all users:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve users'
    });
  }
});

export default router;
