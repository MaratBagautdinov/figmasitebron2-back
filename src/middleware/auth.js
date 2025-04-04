"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.isResourceOwnerOrAdmin = exports.isConfirmedUser = exports.isAdmin = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key';
// Verify JWT token middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN format
    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = {
            userId: decoded.id, // Changed from decoded.userId to match the token payload
            email: decoded.email,
            role: decoded.role || 'user' // Added default role
        };
        next();
    }
    catch (error) {
        return res.status(403).json({ message: 'Invalid token.' });
    }
};
exports.authenticateToken = authenticateToken;
// Admin role check middleware
const isAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Authentication required.' });
    }
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required.' });
    }
    next();
};
exports.isAdmin = isAdmin;
// Middleware to check if user is confirmed
const isConfirmedUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        return res.status(401).json({ message: 'Authentication required.' });
    }
    try {
        const user = yield User_1.UserModel.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        if (!user.is_confirmed) {
            return res.status(403).json({ message: 'Email confirmation required. Please verify your email first.' });
        }
        next();
    }
    catch (error) {
        return res.status(500).json({ message: 'Internal server error.' });
    }
});
exports.isConfirmedUser = isConfirmedUser;
// Middleware to check if user is the owner of a resource or an admin
const isResourceOwnerOrAdmin = (resourceIdParam) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required.' });
        }
        // Admin can access any resource
        if (req.user.role === 'admin') {
            return next();
        }
        const resourceId = req.params[resourceIdParam];
        if (!resourceId) {
            return res.status(400).json({ message: 'Resource ID is required.' });
        }
        // Check if the user is the owner of the resource (implementation depends on the resource type)
        // For example, check if the booking belongs to the user
        // This is a simplified example, actual implementation would vary based on resource type
        if (req.baseUrl.includes('/bookings')) {
            const booking = yield Promise.resolve().then(() => __importStar(require('../models/Booking'))).then(m => m.BookingModel.findById(Number(resourceId)));
            if (!booking) {
                return res.status(404).json({ message: 'Resource not found.' });
            }
            if (booking.user_id !== req.user.userId) {
                return res.status(403).json({ message: 'Access denied. You are not the owner of this resource.' });
            }
        }
        next();
    });
};
exports.isResourceOwnerOrAdmin = isResourceOwnerOrAdmin;
