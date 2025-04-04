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
exports.changePassword = exports.forgotPassword = exports.getCurrentUser = exports.login = exports.resetPassword = exports.confirmEmail = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const User_1 = require("../models/User");
const emailService_1 = __importDefault(require("../config/emailService"));
const init_1 = __importDefault(require("../db/init"));
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key';
// Helper to generate random token
const generateToken = (payload, options = { expiresIn: '24h' }) => {
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, options);
};
// Helper to generate email confirmation token
const generateEmailToken = (email) => {
    return generateToken({ email });
};
// Helper to generate password reset token
const generatePasswordResetToken = (userId) => {
    return generateToken({ id: userId, purpose: 'password_reset' }, { expiresIn: '1h' });
};
// Register a new user
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, firstName, lastName, phone } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }
    try {
        // Check if user already exists
        init_1.default.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => __awaiter(void 0, void 0, void 0, function* () {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            if (user) {
                return res.status(400).json({ error: 'User already exists' });
            }
            // Hash password
            const hashedPassword = yield bcrypt_1.default.hash(password, 10);
            // Create new user
            init_1.default.run('INSERT INTO users (email, password, firstName, lastName, phone, is_confirmed, role) VALUES (?, ?, ?, ?, ?, ?, ?)', [email, hashedPassword, firstName || '', lastName || '', phone || '', true, 'user'], function (err) {
                if (err) {
                    return res.status(500).json({ error: 'Error creating user' });
                }
                const newUser = {
                    id: this.lastID,
                    email,
                    role: 'user'
                };
                const token = generateToken({
                    id: newUser.id,
                    email: newUser.email,
                    purpose: 'auth'
                });
                res.status(201).json({
                    message: 'User registered successfully',
                    token,
                    user: {
                        id: newUser.id,
                        email: newUser.email,
                        firstName,
                        lastName,
                        phone,
                        role: newUser.role
                    }
                });
            });
        }));
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Server error during registration' });
    }
});
exports.register = register;
// Confirm email and set password
const confirmEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.params;
        if (!token) {
            return res.status(400).json({ message: 'Token is required.' });
        }
        try {
            // Verify the token с применением хака для типизации
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || '');
            const email = decoded.email;
            // Find the user
            const user = yield User_1.UserModel.findByEmail(email);
            if (!user) {
                return res.status(404).json({ message: 'User not found.' });
            }
            if (user.is_confirmed) {
                return res.status(400).json({ message: 'Email already confirmed.' });
            }
            // Update user as confirmed
            yield User_1.UserModel.confirmEmail(email);
            // Generate a password reset token for secure password setup
            const passwordResetToken = generatePasswordResetToken(user.id);
            // Send password reset link to user's email
            const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password/${passwordResetToken}`;
            const emailSent = yield emailService_1.default.sendPasswordResetLink(email, resetUrl);
            if (!emailSent) {
                return res.status(500).json({ message: 'Failed to send password setup email.' });
            }
            res.status(200).json({
                message: 'Email confirmed successfully. Please check your email to set up your password.'
            });
        }
        catch (error) {
            return res.status(400).json({ message: 'Invalid or expired token.' });
        }
    }
    catch (error) {
        console.error('Email confirmation error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});
exports.confirmEmail = confirmEmail;
// Reset password
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.params;
        const { password } = req.body;
        if (!token || !password) {
            return res.status(400).json({ message: 'Token and password are required.' });
        }
        if (password.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
        }
        try {
            // Verify the token с применением хака для типизации
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || '');
            if (decoded.purpose !== 'password_reset') {
                return res.status(400).json({ message: 'Invalid token purpose.' });
            }
            const userId = decoded.id;
            // Find the user
            const user = yield User_1.UserModel.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found.' });
            }
            // Update user's password
            yield User_1.UserModel.updatePassword(userId, password);
            res.status(200).json({
                message: 'Password has been reset successfully. You can now log in with your new password.'
            });
        }
        catch (error) {
            return res.status(400).json({ message: 'Invalid or expired token.' });
        }
    }
    catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});
exports.resetPassword = resetPassword;
// User login
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }
    try {
        init_1.default.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => __awaiter(void 0, void 0, void 0, function* () {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            if (!user) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }
            const isValidPassword = yield bcrypt_1.default.compare(password, user.password);
            if (!isValidPassword) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }
            const token = generateToken({
                id: user.id,
                email: user.email,
                purpose: 'auth'
            });
            res.json({
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    phone: user.phone,
                    role: user.role
                }
            });
        }));
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error during login' });
    }
});
exports.login = login;
// Get current user profile
const getCurrentUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required.' });
        }
        const user = yield User_1.UserModel.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.status(200).json({
            id: user.id,
            email: user.email,
            role: user.role,
            created_at: user.created_at
        });
    }
    catch (error) {
        console.error('Get user profile error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});
exports.getCurrentUser = getCurrentUser;
// Forgot password
const forgotPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }
    try {
        init_1.default.get('SELECT id FROM users WHERE email = ?', [email], (err, user) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            const token = generateToken({
                id: user.id,
                email,
                purpose: 'password_reset'
            }, { expiresIn: '1h' });
            // Here you would typically send an email with the reset link
            // For testing, we'll just return the token
            res.json({
                message: 'Password reset token generated',
                token
            });
        });
    }
    catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ error: 'Server error during password reset request' });
    }
});
exports.forgotPassword = forgotPassword;
// Change password (for authenticated users)
const changePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required.' });
        }
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Current password and new password are required.' });
        }
        if (newPassword.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
        }
        // Find the user
        const user = yield User_1.UserModel.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        // Verify current password
        const isValidPassword = yield User_1.UserModel.verifyPassword(user, currentPassword);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Current password is incorrect.' });
        }
        // Update user's password
        yield User_1.UserModel.updatePassword(req.user.userId, newPassword);
        res.status(200).json({
            message: 'Password changed successfully.'
        });
    }
    catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});
exports.changePassword = changePassword;
