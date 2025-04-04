import db from '../db/init';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key';

export interface User {
  id?: number;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  is_confirmed?: boolean;
  role?: string;
  created_at?: string;
}

export class UserModel {
  // Create a new user
  static async create(userData: Omit<User, 'id'>): Promise<User> {
    const { email, password, firstName, lastName, phone, is_confirmed, role } = userData;
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO users (email, password, firstName, lastName, phone, is_confirmed, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [email, hashedPassword, firstName || '', lastName || '', phone || '', is_confirmed ? 1 : 0, role || 'user'],
        function(err) {
          if (err) {
            reject(err);
          } else {
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
        }
      );
    });
  }

  // Get user by email
  static async findByEmail(email: string): Promise<User | null> {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM users WHERE email = ?',
        [email],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row as User || null);
          }
        }
      );
    });
  }

  // Get user by ID
  static async findById(id: number): Promise<User | null> {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM users WHERE id = ?',
        [id],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row as User || null);
          }
        }
      );
    });
  }

  // Confirm user email
  static async confirmEmail(email: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE users SET is_confirmed = 1 WHERE email = ?',
        [email],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.changes > 0);
          }
        }
      );
    });
  }

  // Update user password
  static async updatePassword(userId: number, newPassword: string): Promise<boolean> {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE users SET password = ? WHERE id = ?',
        [hashedPassword, userId],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.changes > 0);
          }
        }
      );
    });
  }

  // Verify user password
  static async verifyPassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password);
  }

  // Generate JWT token
  static generateToken(user: User): string {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role
    };
    
    return jwt.sign(payload, JWT_SECRET as jwt.Secret, { expiresIn: '24h' });
  }
} 