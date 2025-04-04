import { Request, Response } from 'express';
import { EquipmentModel, Equipment } from '../models/Equipment';
import { CategoryModel } from '../models/Category';

// Get all equipment
export const getAllEquipment = async (_req: Request, res: Response) => {
  try {
    const equipment = await EquipmentModel.findAll();
    res.status(200).json(equipment);
  } catch (error) {
    console.error('Error fetching equipment:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Get equipment by ID
export const getEquipmentById = async (req: Request, res: Response) => {
  try {
    const equipmentId = Number(req.params.id);
    
    if (isNaN(equipmentId)) {
      return res.status(400).json({ message: 'Invalid equipment ID.' });
    }
    
    const equipment = await EquipmentModel.findById(equipmentId);
    
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found.' });
    }
    
    res.status(200).json(equipment);
  } catch (error) {
    console.error(`Error fetching equipment ${req.params.id}:`, error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Get equipment by category
export const getEquipmentByCategory = async (req: Request, res: Response) => {
  try {
    const categoryId = Number(req.params.categoryId);
    
    if (isNaN(categoryId)) {
      return res.status(400).json({ message: 'Invalid category ID.' });
    }
    
    // Check if category exists
    const category = await CategoryModel.findById(categoryId);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found.' });
    }
    
    const equipment = await EquipmentModel.findByCategory(categoryId);
    res.status(200).json(equipment);
  } catch (error) {
    console.error(`Error fetching equipment for category ${req.params.categoryId}:`, error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Create a new equipment
export const createEquipment = async (req: Request, res: Response) => {
  try {
    const { name, description, category_id, status } = req.body;
    
    if (!name || !category_id) {
      return res.status(400).json({ message: 'Equipment name and category are required.' });
    }
    
    // Check if category exists
    const category = await CategoryModel.findById(Number(category_id));
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found.' });
    }
    
    const equipmentId = await EquipmentModel.create({
      name,
      description,
      category_id: Number(category_id),
      status: status || 'available'
    });
    
    res.status(201).json({
      id: equipmentId,
      name,
      description,
      category_id,
      status: status || 'available',
      message: 'Equipment created successfully.'
    });
  } catch (error) {
    console.error('Error creating equipment:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Update equipment
export const updateEquipment = async (req: Request, res: Response) => {
  try {
    const equipmentId = Number(req.params.id);
    
    if (isNaN(equipmentId)) {
      return res.status(400).json({ message: 'Invalid equipment ID.' });
    }
    
    const { name, description, category_id, status } = req.body;
    
    // Check if equipment exists
    const existingEquipment = await EquipmentModel.findById(equipmentId);
    
    if (!existingEquipment) {
      return res.status(404).json({ message: 'Equipment not found.' });
    }
    
    // If category_id provided, check if it exists
    if (category_id) {
      const category = await CategoryModel.findById(Number(category_id));
      
      if (!category) {
        return res.status(404).json({ message: 'Category not found.' });
      }
    }
    
    // Update equipment
    const updated = await EquipmentModel.update(equipmentId, {
      name,
      description,
      category_id: category_id ? Number(category_id) : undefined,
      status
    });
    
    if (!updated) {
      return res.status(500).json({ message: 'Failed to update equipment.' });
    }
    
    // Get updated equipment
    const updatedEquipment = await EquipmentModel.findById(equipmentId);
    
    res.status(200).json({
      ...updatedEquipment,
      message: 'Equipment updated successfully.'
    });
  } catch (error) {
    console.error(`Error updating equipment ${req.params.id}:`, error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Update equipment status
export const updateEquipmentStatus = async (req: Request, res: Response) => {
  try {
    const equipmentId = Number(req.params.id);
    
    if (isNaN(equipmentId)) {
      return res.status(400).json({ message: 'Invalid equipment ID.' });
    }
    
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Status is required.' });
    }
    
    // Check if equipment exists
    const existingEquipment = await EquipmentModel.findById(equipmentId);
    
    if (!existingEquipment) {
      return res.status(404).json({ message: 'Equipment not found.' });
    }
    
    // Update status
    const updated = await EquipmentModel.updateStatus(equipmentId, status);
    
    if (!updated) {
      return res.status(500).json({ message: 'Failed to update equipment status.' });
    }
    
    res.status(200).json({
      id: equipmentId,
      status,
      message: 'Equipment status updated successfully.'
    });
  } catch (error) {
    console.error(`Error updating equipment status ${req.params.id}:`, error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Delete equipment
export const deleteEquipment = async (req: Request, res: Response) => {
  try {
    const equipmentId = Number(req.params.id);
    
    if (isNaN(equipmentId)) {
      return res.status(400).json({ message: 'Invalid equipment ID.' });
    }
    
    // Check if equipment exists
    const existingEquipment = await EquipmentModel.findById(equipmentId);
    
    if (!existingEquipment) {
      return res.status(404).json({ message: 'Equipment not found.' });
    }
    
    // Delete equipment
    const deleted = await EquipmentModel.delete(equipmentId);
    
    if (!deleted) {
      return res.status(500).json({ message: 'Failed to delete equipment.' });
    }
    
    res.status(200).json({
      message: 'Equipment deleted successfully.'
    });
  } catch (error) {
    console.error(`Error deleting equipment ${req.params.id}:`, error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Get available equipment
export const getAvailableEquipment = async (_req: Request, res: Response) => {
  try {
    const equipment = await EquipmentModel.findAvailable();
    res.status(200).json(equipment);
  } catch (error) {
    console.error('Error fetching available equipment:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
}; 