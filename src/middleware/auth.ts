import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key';

// Extended Express Request interface to include user information
export interface AuthRequest extends Request {
  user?: {
    userId: number;
    email: string;
    role: string;
  };
}

// Verify JWT token middleware
export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN format
  
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    req.user = {
      userId: decoded.id, // Changed from decoded.userId to match the token payload
      email: decoded.email,
      role: decoded.role || 'user' // Added default role
    };
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token.' });
  }
};

// Admin role check middleware
export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required.' });
  }

  next();
};

// Middleware to check if user is confirmed
export const isConfirmedUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  try {
    const user = await UserModel.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    
    if (!user.is_confirmed) {
      return res.status(403).json({ message: 'Email confirmation required. Please verify your email first.' });
    }
    
    next();
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

// Middleware to check if user is the owner of a resource or an admin
export const isResourceOwnerOrAdmin = (resourceIdParam: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    // Admin can access any resource
    if (req.user.role === 'admin') {
      return next();
    }

    const resourceId = req.params[resourceIdParam];
    
    if (!resourceId) {
      return res.status(400).json({ message: 'Resource ID is required.' });
    }
    
    // Check if the user is the owner of the resource (implementation depends on the resource type)
    // For example, check if the booking belongs to the user
    
    // This is a simplified example, actual implementation would vary based on resource type
    if (req.baseUrl.includes('/bookings')) {
      const booking = await import('../models/Booking').then(m => m.BookingModel.findById(Number(resourceId)));
      
      if (!booking) {
        return res.status(404).json({ message: 'Resource not found.' });
      }
      
      if (booking.user_id !== req.user.userId) {
        return res.status(403).json({ message: 'Access denied. You are not the owner of this resource.' });
      }
    }
    
    next();
  };
}; 