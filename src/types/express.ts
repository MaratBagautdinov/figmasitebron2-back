import { Request } from 'express';

// Расширение типа Request для добавления пользовательских данных
export interface CustomRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
} 