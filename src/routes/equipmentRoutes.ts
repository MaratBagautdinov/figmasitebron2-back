import express from 'express';
import * as equipmentController from '../controllers/equipmentController';
import { authenticateToken, isAdmin } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/', equipmentController.getAllEquipment as express.RequestHandler);
router.get('/available', equipmentController.getAvailableEquipment as express.RequestHandler);
router.get('/category/:categoryId', equipmentController.getEquipmentByCategory as express.RequestHandler);
router.get('/:id', equipmentController.getEquipmentById as express.RequestHandler);

// Admin routes
router.post('/', 
  authenticateToken as express.RequestHandler, 
  isAdmin as express.RequestHandler, 
  equipmentController.createEquipment as express.RequestHandler
);
router.put('/:id', 
  authenticateToken as express.RequestHandler, 
  isAdmin as express.RequestHandler, 
  equipmentController.updateEquipment as express.RequestHandler
);
router.patch('/:id/status', 
  authenticateToken as express.RequestHandler, 
  isAdmin as express.RequestHandler, 
  equipmentController.updateEquipmentStatus as express.RequestHandler
);
router.delete('/:id', 
  authenticateToken as express.RequestHandler, 
  isAdmin as express.RequestHandler, 
  equipmentController.deleteEquipment as express.RequestHandler
);

export default router; 