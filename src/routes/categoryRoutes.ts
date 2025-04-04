import express from 'express';
import * as categoryController from '../controllers/categoryController';
import { authenticateToken, isAdmin } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/', categoryController.getAllCategories as express.RequestHandler);
router.get('/:id', categoryController.getCategoryById as express.RequestHandler);

// Admin routes
router.post('/', 
  authenticateToken as express.RequestHandler, 
  isAdmin as express.RequestHandler, 
  categoryController.createCategory as express.RequestHandler
);
router.put('/:id', 
  authenticateToken as express.RequestHandler, 
  isAdmin as express.RequestHandler, 
  categoryController.updateCategory as express.RequestHandler
);
router.delete('/:id', 
  authenticateToken as express.RequestHandler, 
  isAdmin as express.RequestHandler, 
  categoryController.deleteCategory as express.RequestHandler
);

export default router; 