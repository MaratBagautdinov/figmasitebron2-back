"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getCategoryById = exports.getAllCategories = void 0;
const Category_1 = require("../models/Category");
// Get all categories
const getAllCategories = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield Category_1.CategoryModel.findAll();
        res.status(200).json(categories);
    }
    catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});
exports.getAllCategories = getAllCategories;
// Get category by ID
const getCategoryById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categoryId = Number(req.params.id);
        if (isNaN(categoryId)) {
            return res.status(400).json({ message: 'Invalid category ID.' });
        }
        const category = yield Category_1.CategoryModel.findById(categoryId);
        if (!category) {
            return res.status(404).json({ message: 'Category not found.' });
        }
        res.status(200).json(category);
    }
    catch (error) {
        console.error(`Error fetching category ${req.params.id}:`, error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});
exports.getCategoryById = getCategoryById;
// Create a new category
const createCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description } = req.body;
        if (!name) {
            return res.status(400).json({ message: 'Category name is required.' });
        }
        const categoryId = yield Category_1.CategoryModel.create({
            name,
            description
        });
        res.status(201).json({
            id: categoryId,
            name,
            description,
            message: 'Category created successfully.'
        });
    }
    catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});
exports.createCategory = createCategory;
// Update a category
const updateCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const existingCategory = yield Category_1.CategoryModel.findById(categoryId);
        if (!existingCategory) {
            return res.status(404).json({ message: 'Category not found.' });
        }
        // Update category
        const updated = yield Category_1.CategoryModel.update(categoryId, {
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
    }
    catch (error) {
        console.error(`Error updating category ${req.params.id}:`, error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});
exports.updateCategory = updateCategory;
// Delete a category
const deleteCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categoryId = Number(req.params.id);
        if (isNaN(categoryId)) {
            return res.status(400).json({ message: 'Invalid category ID.' });
        }
        // Check if category exists
        const existingCategory = yield Category_1.CategoryModel.findById(categoryId);
        if (!existingCategory) {
            return res.status(404).json({ message: 'Category not found.' });
        }
        // Delete category
        const deleted = yield Category_1.CategoryModel.delete(categoryId);
        if (!deleted) {
            return res.status(500).json({ message: 'Failed to delete category.' });
        }
        res.status(200).json({
            message: 'Category deleted successfully.'
        });
    }
    catch (error) {
        console.error(`Error deleting category ${req.params.id}:`, error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});
exports.deleteCategory = deleteCategory;
