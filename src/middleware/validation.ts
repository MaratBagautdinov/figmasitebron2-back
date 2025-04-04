import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

// Validation schemas
export const schemas = {
  // Auth schemas
  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    firstName: Joi.string().min(2).max(50).required(),
    lastName: Joi.string().min(2).max(50).required(),
    phone: Joi.string().min(5).max(20).required()
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  resetPassword: Joi.object({
    password: Joi.string().min(8).required()
  }),

  // Equipment schemas
  equipment: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    description: Joi.string().max(1000),
    category_id: Joi.number().integer().required(),
    status: Joi.string().valid('available', 'unavailable', 'maintenance')
  }),

  // Booking schemas
  booking: Joi.object({
    equipment_id: Joi.number().integer().required(),
    start_date: Joi.date().iso().required(),
    end_date: Joi.date().iso().min(Joi.ref('start_date')).required()
  })
};

// Validation middleware factory
export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map((detail: Joi.ValidationErrorItem) => ({
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