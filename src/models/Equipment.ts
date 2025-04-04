import db from '../db/init';

export interface Equipment {
  id?: number;
  name: string;
  description?: string;
  category_id: number;
  status?: string;
}

export class EquipmentModel {
  // Create a new equipment
  static async create(equipmentData: Omit<Equipment, 'id'>): Promise<number> {
    const { name, description, category_id, status } = equipmentData;
    
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO equipment (name, description, category_id, status) VALUES (?, ?, ?, ?)',
        [name, description || null, category_id, status || 'available'],
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

  // Get all equipment
  static async findAll(): Promise<Equipment[]> {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM equipment',
        [],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows as Equipment[]);
          }
        }
      );
    });
  }

  // Get equipment by ID
  static async findById(id: number): Promise<Equipment | null> {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM equipment WHERE id = ?',
        [id],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row as Equipment || null);
          }
        }
      );
    });
  }

  // Get equipment by category
  static async findByCategory(categoryId: number): Promise<Equipment[]> {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM equipment WHERE category_id = ?',
        [categoryId],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows as Equipment[]);
          }
        }
      );
    });
  }

  // Update equipment
  static async update(id: number, equipmentData: Partial<Equipment>): Promise<boolean> {
    const { name, description, category_id, status } = equipmentData;
    
    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE equipment
         SET name = COALESCE(?, name),
             description = COALESCE(?, description),
             category_id = COALESCE(?, category_id),
             status = COALESCE(?, status)
         WHERE id = ?`,
        [name, description, category_id, status, id],
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

  // Update equipment status
  static async updateStatus(id: number, status: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE equipment SET status = ? WHERE id = ?',
        [status, id],
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

  // Delete equipment
  static async delete(id: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      db.run(
        'DELETE FROM equipment WHERE id = ?',
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

  // Get available equipment (not booked)
  static async findAvailable(): Promise<Equipment[]> {
    return new Promise((resolve, reject) => {
      db.all(
        "SELECT * FROM equipment WHERE status = 'available'",
        [],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows as Equipment[]);
          }
        }
      );
    });
  }
} 