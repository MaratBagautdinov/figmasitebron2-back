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
exports.getAvailableEquipment = exports.deleteEquipment = exports.updateEquipmentStatus = exports.updateEquipment = exports.createEquipment = exports.getEquipmentByCategory = exports.getEquipmentById = exports.getAllEquipment = void 0;
const Equipment_1 = require("../models/Equipment");
const Category_1 = require("../models/Category");
// Get all equipment
const getAllEquipment = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const equipment = yield Equipment_1.EquipmentModel.findAll();
        res.status(200).json(equipment);
    }
    catch (error) {
        console.error('Error fetching equipment:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});
exports.getAllEquipment = getAllEquipment;
// Get equipment by ID
const getEquipmentById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const equipmentId = Number(req.params.id);
        if (isNaN(equipmentId)) {
            return res.status(400).json({ message: 'Invalid equipment ID.' });
        }
        const equipment = yield Equipment_1.EquipmentModel.findById(equipmentId);
        if (!equipment) {
            return res.status(404).json({ message: 'Equipment not found.' });
        }
        res.status(200).json(equipment);
    }
    catch (error) {
        console.error(`Error fetching equipment ${req.params.id}:`, error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});
exports.getEquipmentById = getEquipmentById;
// Get equipment by category
const getEquipmentByCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categoryId = Number(req.params.categoryId);
        if (isNaN(categoryId)) {
            return res.status(400).json({ message: 'Invalid category ID.' });
        }
        // Check if category exists
        const category = yield Category_1.CategoryModel.findById(categoryId);
        if (!category) {
            return res.status(404).json({ message: 'Category not found.' });
        }
        const equipment = yield Equipment_1.EquipmentModel.findByCategory(categoryId);
        res.status(200).json(equipment);
    }
    catch (error) {
        console.error(`Error fetching equipment for category ${req.params.categoryId}:`, error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});
exports.getEquipmentByCategory = getEquipmentByCategory;
// Create a new equipment
const createEquipment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description, category_id, status } = req.body;
        if (!name || !category_id) {
            return res.status(400).json({ message: 'Equipment name and category are required.' });
        }
        // Check if category exists
        const category = yield Category_1.CategoryModel.findById(Number(category_id));
        if (!category) {
            return res.status(404).json({ message: 'Category not found.' });
        }
        const equipmentId = yield Equipment_1.EquipmentModel.create({
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
    }
    catch (error) {
        console.error('Error creating equipment:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});
exports.createEquipment = createEquipment;
// Update equipment
const updateEquipment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const equipmentId = Number(req.params.id);
        if (isNaN(equipmentId)) {
            return res.status(400).json({ message: 'Invalid equipment ID.' });
        }
        const { name, description, category_id, status } = req.body;
        // Check if equipment exists
        const existingEquipment = yield Equipment_1.EquipmentModel.findById(equipmentId);
        if (!existingEquipment) {
            return res.status(404).json({ message: 'Equipment not found.' });
        }
        // If category_id provided, check if it exists
        if (category_id) {
            const category = yield Category_1.CategoryModel.findById(Number(category_id));
            if (!category) {
                return res.status(404).json({ message: 'Category not found.' });
            }
        }
        // Update equipment
        const updated = yield Equipment_1.EquipmentModel.update(equipmentId, {
            name,
            description,
            category_id: category_id ? Number(category_id) : undefined,
            status
        });
        if (!updated) {
            return res.status(500).json({ message: 'Failed to update equipment.' });
        }
        // Get updated equipment
        const updatedEquipment = yield Equipment_1.EquipmentModel.findById(equipmentId);
        res.status(200).json(Object.assign(Object.assign({}, updatedEquipment), { message: 'Equipment updated successfully.' }));
    }
    catch (error) {
        console.error(`Error updating equipment ${req.params.id}:`, error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});
exports.updateEquipment = updateEquipment;
// Update equipment status
const updateEquipmentStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const existingEquipment = yield Equipment_1.EquipmentModel.findById(equipmentId);
        if (!existingEquipment) {
            return res.status(404).json({ message: 'Equipment not found.' });
        }
        // Update status
        const updated = yield Equipment_1.EquipmentModel.updateStatus(equipmentId, status);
        if (!updated) {
            return res.status(500).json({ message: 'Failed to update equipment status.' });
        }
        res.status(200).json({
            id: equipmentId,
            status,
            message: 'Equipment status updated successfully.'
        });
    }
    catch (error) {
        console.error(`Error updating equipment status ${req.params.id}:`, error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});
exports.updateEquipmentStatus = updateEquipmentStatus;
// Delete equipment
const deleteEquipment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const equipmentId = Number(req.params.id);
        if (isNaN(equipmentId)) {
            return res.status(400).json({ message: 'Invalid equipment ID.' });
        }
        // Check if equipment exists
        const existingEquipment = yield Equipment_1.EquipmentModel.findById(equipmentId);
        if (!existingEquipment) {
            return res.status(404).json({ message: 'Equipment not found.' });
        }
        // Delete equipment
        const deleted = yield Equipment_1.EquipmentModel.delete(equipmentId);
        if (!deleted) {
            return res.status(500).json({ message: 'Failed to delete equipment.' });
        }
        res.status(200).json({
            message: 'Equipment deleted successfully.'
        });
    }
    catch (error) {
        console.error(`Error deleting equipment ${req.params.id}:`, error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});
exports.deleteEquipment = deleteEquipment;
// Get available equipment
const getAvailableEquipment = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const equipment = yield Equipment_1.EquipmentModel.findAvailable();
        res.status(200).json(equipment);
    }
    catch (error) {
        console.error('Error fetching available equipment:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});
exports.getAvailableEquipment = getAvailableEquipment;
