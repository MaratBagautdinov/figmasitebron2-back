"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = exports.schemas = void 0;
const joi_1 = __importDefault(require("joi"));
// Validation schemas
exports.schemas = {
    // Auth schemas
    register: joi_1.default.object({
        email: joi_1.default.string().email().required(),
        password: joi_1.default.string().min(8).required(),
        firstName: joi_1.default.string().min(2).max(50).required(),
        lastName: joi_1.default.string().min(2).max(50).required(),
        phone: joi_1.default.string().min(5).max(20).required()
    }),
    login: joi_1.default.object({
        email: joi_1.default.string().email().required(),
        password: joi_1.default.string().required()
    }),
    resetPassword: joi_1.default.object({
        password: joi_1.default.string().min(8).required()
    }),
    // Equipment schemas
    equipment: joi_1.default.object({
        name: joi_1.default.string().min(2).max(100).required(),
        description: joi_1.default.string().max(1000),
        category_id: joi_1.default.number().integer().required(),
        status: joi_1.default.string().valid('available', 'unavailable', 'maintenance')
    }),
    // Booking schemas
    booking: joi_1.default.object({
        equipment_id: joi_1.default.number().integer().required(),
        start_date: joi_1.default.date().iso().required(),
        end_date: joi_1.default.date().iso().min(joi_1.default.ref('start_date')).required()
    })
};
// Validation middleware factory
const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });
        if (error) {
            const errors = error.details.map((detail) => ({
                field: detail.path.join('.'),
                message: detail.message
            }));
            res.status(400).json({
                message: 'Validation error',
                errors
            });
            return;
        }
        next();
    };
};
exports.validate = validate;
