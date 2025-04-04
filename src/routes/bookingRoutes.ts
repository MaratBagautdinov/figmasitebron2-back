import express from 'express';
import * as bookingController from '../controllers/bookingController';
import { authenticateToken, isAdmin } from '../middleware/auth';
import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';

const router = express.Router();

type CustomRequestHandler<T = any> = (
  req: Request | AuthRequest,
  res: Response,
  next: NextFunction
) => Promise<Response<T>> | Response<T> | Promise<void> | void;

// Публичные маршруты для проверки доступности
router.get('/availability', bookingController.checkAvailability as any);

// Защищенные маршруты для создания и управления бронированием
router.post(
  '/', 
  authenticateToken as any,
  bookingController.createBooking as any
);

router.get(
  '/user', 
  authenticateToken as any,
  bookingController.getUserBookings as any
);

// Маршруты администратора
router.get(
  '/admin/all', 
  authenticateToken as any,
  isAdmin as any,
  bookingController.getAllBookings as any
);

// Маршруты с параметрами
router.get(
  '/:id', 
  authenticateToken as any,
  bookingController.getBookingById as any
);

router.put(
  '/:id', 
  authenticateToken as any,
  bookingController.updateBooking as any
);

router.delete(
  '/:id', 
  authenticateToken as any,
  bookingController.cancelBooking as any
);

export default router; 