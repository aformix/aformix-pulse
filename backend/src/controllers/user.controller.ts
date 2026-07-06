import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Project from '../models/Project.js';
import CrawlResult from '../models/CrawlResult.js';

export const updateProfile = async (req: any, res: Response): Promise<void> => {
  try {
    const { name, email } = req.body;
    const userId = req.user.userId;

    if (!name || !email) {
      res.status(400).json({ message: 'Name and email are required' });
      return;
    }

    // Check if the new email is already in use by another user
    const existingUser = await User.findOne({ email, _id: { $ne: userId } });
    if (existingUser) {
      res.status(409).json({ message: 'Email is already in use' });
      return;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, email },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json({
      message: 'Profile updated successfully',
      user: { id: updatedUser.id, name: updatedUser.name, email: updatedUser.email, avatar: updatedUser.avatar },
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updatePassword = async (req: any, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ message: 'Current and new passwords are required' });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // If user registered with Google and doesn't have a password yet
    if (!user.password && user.googleId) {
      res.status(400).json({ message: 'Account uses Google Sign-In. Password cannot be changed.' });
      return;
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password || '');
    if (!isMatch) {
      res.status(401).json({ message: 'Incorrect current password' });
      return;
    }

    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Update Password Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteAccount = async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Cascade delete: remove all crawl results and projects owned by the user
    await CrawlResult.deleteMany({ userId });
    await Project.deleteMany({ userId });

    // Finally, delete the user
    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: 'Account and all associated data deleted successfully' });
  } catch (error) {
    console.error('Delete Account Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
