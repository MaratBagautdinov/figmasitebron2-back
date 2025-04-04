import db from '../db/init';

export interface Category {
  id?: number;
  name: string;
  description?: string;
}

export class CategoryModel {
  // Create a new category
  static async create(categoryData: Omit<Category, 'id'>): Promise<number> {
    const { name, description } = categoryData;
    
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO categories (name, description) VALUES (?, ?)',
        [name, description || null],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.lastID);
          }
        }
      );
    });
  }

  // Get all categories
  static async findAll(): Promise<Category[]> {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM categories',
        [],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows as Category[]);
          }
        }
      );
    });
  }

  // Get category by ID
  static async findById(id: number): Promise<Category | null> {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM categories WHERE id = ?',
        [id],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row as Category || null);
          }
        }
      );
    });
  }

  // Update category
  static async update(id: number, categoryData: Partial<Category>): Promise<boolean> {
    const { name, description } = categoryData;
    
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE categories SET name = ?, description = ? WHERE id = ?',
        [name, description, id],
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

  // Delete category
  static async delete(id: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      db.run(
        'DELETE FROM categories WHERE id = ?',
        [id],
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
} 