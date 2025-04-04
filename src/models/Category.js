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
exports.CategoryModel = void 0;
const init_1 = __importDefault(require("../db/init"));
class CategoryModel {
    // Create a new category
    static create(categoryData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, description } = categoryData;
            return new Promise((resolve, reject) => {
                init_1.default.run('INSERT INTO categories (name, description) VALUES (?, ?)', [name, description || null], function (err) {
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
    // Get all categories
    static findAll() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                init_1.default.all('SELECT * FROM categories', [], (err, rows) => {
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
    // Get category by ID
    static findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                init_1.default.get('SELECT * FROM categories WHERE id = ?', [id], (err, row) => {
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
    // Update category
    static update(id, categoryData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, description } = categoryData;
            return new Promise((resolve, reject) => {
                init_1.default.run('UPDATE categories SET name = ?, description = ? WHERE id = ?', [name, description, id], function (err) {
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
    // Delete category
    static delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                init_1.default.run('DELETE FROM categories WHERE id = ?', [id], function (err) {
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
}
exports.CategoryModel = CategoryModel;
