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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EquipmentModel = void 0;
const init_1 = __importDefault(require("../db/init"));
class EquipmentModel {
    // Create a new equipment
    static create(equipmentData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, description, category_id, status } = equipmentData;
            return new Promise((resolve, reject) => {
                init_1.default.run('INSERT INTO equipment (name, description, category_id, status) VALUES (?, ?, ?, ?)', [name, description || null, category_id, status || 'available'], function (err) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(this.lastID);
                    }
                });
            });
        });
    }
    // Get all equipment
    static findAll() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                init_1.default.all('SELECT * FROM equipment', [], (err, rows) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(rows);
                    }
                });
            });
        });
    }
    // Get equipment by ID
    static findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                init_1.default.get('SELECT * FROM equipment WHERE id = ?', [id], (err, row) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(row || null);
                    }
                });
            });
        });
    }
    // Get equipment by category
    static findByCategory(categoryId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                init_1.default.all('SELECT * FROM equipment WHERE category_id = ?', [categoryId], (err, rows) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(rows);
                    }
                });
            });
        });
    }
    // Update equipment
    static update(id, equipmentData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, description, category_id, status } = equipmentData;
            return new Promise((resolve, reject) => {
                init_1.default.run(`UPDATE equipment
         SET name = COALESCE(?, name),
             description = COALESCE(?, description),
             category_id = COALESCE(?, category_id),
             status = COALESCE(?, status)
         WHERE id = ?`, [name, description, category_id, status, id], function (err) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(this.changes > 0);
                    }
                });
            });
        });
    }
    // Update equipment status
    static updateStatus(id, status) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                init_1.default.run('UPDATE equipment SET status = ? WHERE id = ?', [status, id], function (err) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(this.changes > 0);
                    }
                });
            });
        });
    }
    // Delete equipment
    static delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                init_1.default.run('DELETE FROM equipment WHERE id = ?', [id], function (err) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(this.changes > 0);
                    }
                });
            });
        });
    }
    // Get available equipment (not booked)
    static findAvailable() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                init_1.default.all("SELECT * FROM equipment WHERE status = 'available'", [], (err, rows) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(rows);
                    }
                });
            });
        });
    }
}
exports.EquipmentModel = EquipmentModel;
