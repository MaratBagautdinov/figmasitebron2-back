import { Request, Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import { UserModel, User } from '../models/User';
import emailService from '../config/emailService';
import { AuthRequest } from '../middleware/auth';
import db from '../db/init';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key';

interface DBUser {
  id: number;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: string;
}

interface TokenUser {
  id: number;
  email: string;
  role: string;
}

interface TokenPayload {
  id?: number;
  email?: string;
  purpose?: string;
}

// Helper to generate random token
const generateToken = (payload: TokenPayload, options: SignOptions = { expiresIn: '24h' }): string => {
  return jwt.sign(payload, JWT_SECRET as jwt.Secret, options);
};

// Helper to generate email confirmation token
const generateEmailToken = (email: string): string => {
  return generateToken({ email });
};

// Helper to generate password reset token
const generatePasswordResetToken = (userId: number): string => {
  return generateToken({ id: userId, purpose: 'password_reset' }, { expiresIn: '1h' });
};

// Register a new user
export const register = async (req: Request, res: Response) => {
  const { email, password, firstName, lastName, phone } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    // Check if user already exists
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user: DBUser | undefined) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (user) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user
      db.run(
        'INSERT INTO users (email, password, firstName, lastName, phone, is_confirmed, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [email, hashedPassword, firstName || '', lastName || '', phone || '', true, 'user'],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Error creating user' });
          }

          const newUser: TokenUser = {
            id: this.lastID,
            email,
            role: 'user'
          };

          const token = generateToken({
            id: newUser.id,
            email: newUser.email,
            purpose: 'auth'
          });

          res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
              id: newUser.id,
              email: newUser.email,
              firstName,
              lastName,
              phone,
              role: newUser.role
            }
          });
        }
      );
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

// Confirm email and set password
export const confirmEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    
    if (!token) {
      return res.status(400).json({ message: 'Token is required.' });
    }
    
    try {
      // Verify the token с применением хака для типизации
      const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as any;
      const email = decoded.email;
      
      // Find the user
      const user = await UserModel.findByEmail(email);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }
      
      if (user.is_confirmed) {
        return res.status(400).json({ message: 'Email already confirmed.' });
      }
      
      // Update user as confirmed
      await UserModel.confirmEmail(email);
      
      // Generate a password reset token for secure password setup
      const passwordResetToken = generatePasswordResetToken(user.id as number);
      
      // Send password reset link to user's email
      const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password/${passwordResetToken}`;
      const emailSent = await emailService.sendPasswordResetLink(email, resetUrl);
      
      if (!emailSent) {
        return res.status(500).json({ message: 'Failed to send password setup email.' });
      }
      
      res.status(200).json({
        message: 'Email confirmed successfully. Please check your email to set up your password.'
      });
    } catch (error) {
      return res.status(400).json({ message: 'Invalid or expired token.' });
    }
  } catch (error) {
    console.error('Email confirmation error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Reset password
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    
    if (!token || !password) {
      return res.status(400).json({ message: 'Token and password are required.' });
    }
    
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
    }
    
    try {
      // Verify the token с применением хака для типизации
      const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as any;
      
      if (decoded.purpose !== 'password_reset') {
        return res.status(400).json({ message: 'Invalid token purpose.' });
      }
      
      const userId = decoded.id;
      
      // Find the user
      const user = await UserModel.findById(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }
      
      // Update user's password
      await UserModel.updatePassword(userId, password);
      
      res.status(200).json({
        message: 'Password has been reset successfully. You can now log in with your new password.'
      });
    } catch (error) {
      return res.status(400).json({ message: 'Invalid or expired token.' });
    }
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// User login
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user: DBUser | undefined) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = generateToken({
        id: user.id,
        email: user.email,
        purpose: 'auth'
      });

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          role: user.role
        }
      });
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
};

// Get current user profile
export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }
    
    const user = await UserModel.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    
    res.status(200).json({
      id: user.id,
      email: user.email,
      role: user.role,
      created_at: user.created_at
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Forgot password
export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    db.get('SELECT id FROM users WHERE email = ?', [email], (err, user: { id: number } | undefined) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const token = generateToken({
        id: user.id,
        email,
        purpose: 'password_reset'
      }, { expiresIn: '1h' });

      // Here you would typically send an email with the reset link
      // For testing, we'll just return the token
      res.json({
        message: 'Password reset token generated',
        token
      });
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Server error during password reset request' });
  }
};

// Change password (for authenticated users)
export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }
    
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required.' });
    }
    
    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
    }
    
    // Find the user
    const user = await UserModel.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    
    // Verify current password
    const isValidPassword = await UserModel.verifyPassword(user, currentPassword);
    
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Current password is incorrect.' });
    }
    
    // Update user's password
    await UserModel.updatePassword(req.user.userId, newPassword);
    
    res.status(200).json({
      message: 'Password changed successfully.'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
}; 