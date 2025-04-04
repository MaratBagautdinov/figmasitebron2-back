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
exports.UserModel = void 0;
const init_1 = __importDefault(require("../db/init"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key';
class UserModel {
    // Create a new user
    static create(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, password, firstName, lastName, phone, is_confirmed, role } = userData;
            // Hash the password
            const hashedPassword = yield bcrypt_1.default.hash(password, 10);
            return new Promise((resolve, reject) => {
                init_1.default.run('INSERT INTO users (email, password, firstName, lastName, phone, is_confirmed, role) VALUES (?, ?, ?, ?, ?, ?, ?)', [email, hashedPassword, firstName || '', lastName || '', phone || '', is_confirmed ? 1 : 0, role || 'user'], function (err) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        // Return the created user
                        const userId = this.lastID;
                        resolve({
                            id: userId,
                            email,
                            password: hashedPassword,
                            firstName,
                            lastName,
                            phone,
                            is_confirmed,
                            role
                        });
                    }
                });
            });
        });
    }
    // Get user by email
    static findByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                init_1.default.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
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
    // Get user by ID
    static findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                init_1.default.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
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
    // Confirm user email
    static confirmEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                init_1.default.run('UPDATE users SET is_confirmed = 1 WHERE email = ?', [email], function (err) {
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
    // Update user password
    static updatePassword(userId, newPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            const hashedPassword = yield bcrypt_1.default.hash(newPassword, 10);
            return new Promise((resolve, reject) => {
                init_1.default.run('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId], function (err) {
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
    // Verify user password
    static verifyPassword(user, password) {
        return __awaiter(this, void 0, void 0, function* () {
            return bcrypt_1.default.compare(password, user.password);
        });
    }
    // Generate JWT token
    static generateToken(user) {
        const payload = {
            id: user.id,
            email: user.email,
            role: user.role
        };
        return jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: '24h' });
    }
}
exports.UserModel = UserModel;
