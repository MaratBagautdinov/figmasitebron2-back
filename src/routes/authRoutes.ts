import express, { RequestHandler } from 'express';
import * as authController from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';
import { validate, schemas } from '../middleware/validation';

const router = express.Router();

// Public routes
router.post('/register', validate(schemas.register) as RequestHandler, authController.register as RequestHandler);
router.post('/login', validate(schemas.login) as RequestHandler, authController.login as RequestHandler);
router.post('/forgot-password', validate(schemas.login) as RequestHandler, authController.forgotPassword as RequestHandler);
router.post('/reset-password/:token', validate(schemas.resetPassword) as RequestHandler, authController.resetPassword as RequestHandler);

// Protected routes
router.get('/profile', authenticateToken as RequestHandler, authController.getCurrentUser as RequestHandler);

export default router; 