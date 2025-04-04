import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcrypt';

// Ensure database directory exists
const dbDir = path.resolve(__dirname, '../../database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'equipment_rental.db');
const db = new sqlite3.Database(dbPath);

// Create tables
export const initializeDatabase = () => {
  return new Promise<void>((resolve, reject) => {
    db.serialize(() => {
      // Users table
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          firstName TEXT DEFAULT '',
          lastName TEXT DEFAULT '',
          phone TEXT DEFAULT '',
          is_confirmed BOOLEAN DEFAULT 0,
          role TEXT DEFAULT 'user',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create test user if not exists
      const testPassword = 'password123';
      bcrypt.hash(testPassword, 10, (err, hash) => {
        if (err) {
          console.error('Error hashing password:', err);
          return;
        }
        
        db.run(`
          INSERT OR IGNORE INTO users (email, password, firstName, lastName, is_confirmed, role)
          VALUES (?, ?, ?, ?, ?, ?)
        `, ['test@example.com', hash, 'Test', 'User', 1, 'user']);
      });

      // Categories table
      db.run(`
        CREATE TABLE IF NOT EXISTS categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT
        )
      `);

      // Equipment table
      db.run(`
        CREATE TABLE IF NOT EXISTS equipment (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          category_id INTEGER,
          status TEXT DEFAULT 'available',
          FOREIGN KEY (category_id) REFERENCES categories(id)
        )
      `);

      // Bookings table
      db.run(`
        CREATE TABLE IF NOT EXISTS bookings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          equipment_id INTEGER NOT NULL,
          booking_date DATETIME DEFAULT CURRENT_TIMESTAMP,
          start_date DATETIME NOT NULL,
          end_date DATETIME NOT NULL,
          status TEXT DEFAULT 'active',
          FOREIGN KEY (user_id) REFERENCES users(id),
          FOREIGN KEY (equipment_id) REFERENCES equipment(id)
        )
      `, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  });
};

export default db; 