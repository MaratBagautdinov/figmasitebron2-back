import { Request, Response } from 'express';
import { CategoryModel, Category } from '../models/Category';

// Get all categories
export const getAllCategories = async (_req: Request, res: Response) => {
  try {
    const categories = await CategoryModel.findAll();
    res.status(200).json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Get category by ID
export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const categoryId = Number(req.params.id);
    
    if (isNaN(categoryId)) {
      return res.status(400).json({ message: 'Invalid category ID.' });
    }
    
    const category = await CategoryModel.findById(categoryId);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found.' });
    }
    
    res.status(200).json(category);
  } catch (error) {
    console.error(`Error fetching category ${req.params.id}:`, error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Create a new category
export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Category name is required.' });
    }
    
    const categoryId = await CategoryModel.create({
      name,
      description
    });
    
    res.status(201).json({
      id: categoryId,
      name,
      description,
      message: 'Category created successfully.'
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Update a category
export const updateCategory = async (req: Request, res: Response) => {
  try {
    const categoryId = Number(req.params.id);
    
    if (isNaN(categoryId)) {
      return res.status(400).json({ message: 'Invalid category ID.' });
    }
    
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Category name is required.' });
    }
    
    // Check if category exists
    const existingCategory = await CategoryModel.findById(categoryId);
    
    if (!existingCategory) {
      return res.status(404).json({ message: 'Category not found.' });
    }
    
    // Update category
    const updated = await CategoryModel.update(categoryId, {
      name,
      description
    });
    
    if (!updated) {
      return res.status(500).json({ message: 'Failed to update category.' });
    }
    
    res.status(200).json({
      id: categoryId,
      name,
      description,
      message: 'Category updated successfully.'
    });
  } catch (error) {
    console.error(`Error updating category ${req.params.id}:`, error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Delete a category
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const categoryId = Number(req.params.id);
    
    if (isNaN(categoryId)) {
      return res.status(400).json({ message: 'Invalid category ID.' });
    }
    
    // Check if category exists
    const existingCategory = await CategoryModel.findById(categoryId);
    
    if (!existingCategory) {
      return res.status(404).json({ message: 'Category not found.' });
    }
    
    // Delete category
    const deleted = await CategoryModel.delete(categoryId);
    
    if (!deleted) {
      return res.status(500).json({ message: 'Failed to delete category.' });
    }
    
    res.status(200).json({
      message: 'Category deleted successfully.'
    });
  } catch (error) {
    console.error(`Error deleting category ${req.params.id}:`, error);
    res.status(500).json({ message: 'Internal server error.' });
  }
}; 