import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { initializeDatabase } from './db/init';

// Import routes
import authRoutes from './routes/authRoutes';
import categoryRoutes from './routes/categoryRoutes';
import equipmentRoutes from './routes/equipmentRoutes';
import bookingRoutes from './routes/bookingRoutes';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet()); // Adds various HTTP headers for security
app.use(cors()); // Разрешаем запросы с любого источника для тестирования

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Увеличиваем лимит для тестирования
  message: 'Too many requests from this IP, please try again later.'
});

// Apply rate limiting to all routes
app.use(limiter);

// Закомментируем строгое ограничение для тестирования
// Stricter rate limiting for auth routes
// const authLimiter = rateLimit({
//   windowMs: 60 * 60 * 1000, // 1 hour
//   max: 5, // Limit each IP to 5 failed requests per hour
//   message: 'Too many failed attempts, please try again later.'
// });

// Apply stricter rate limiting to auth routes
// app.use('/api/auth/login', authLimiter);
// app.use('/api/auth/register', authLimiter);
// app.use('/api/auth/forgot-password', authLimiter);

// Middleware
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/bookings', bookingRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Initialize database and start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
}); 