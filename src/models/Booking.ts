import db from '../db/init';

export interface Booking {
  id?: number;
  user_id: number;
  equipment_id: number;
  booking_date?: string;
  start_date: string;
  start_time?: string; // Время начала аренды (HH:MM)
  rental_days: number; // Количество дней аренды
  end_date: string;
  status?: string;
}

export class BookingModel {
  // Create a new booking
  static async create(bookingData: Omit<Booking, 'id' | 'booking_date'>): Promise<number> {
    const { user_id, equipment_id, start_date, start_time, rental_days, end_date, status } = bookingData;
    
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO bookings (user_id, equipment_id, start_date, start_time, rental_days, end_date, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [user_id, equipment_id, start_date, start_time, rental_days, end_date, status || 'active'],
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

  // Get all bookings
  static async findAll(): Promise<Booking[]> {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM bookings ORDER BY booking_date DESC',
        [],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows as Booking[]);
          }
        }
      );
    });
  }

  // Get booking by ID
  static async findById(id: number): Promise<Booking | null> {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM bookings WHERE id = ?',
        [id],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row as Booking || null);
          }
        }
      );
    });
  }

  // Get user bookings
  static async findByUserId(userId: number): Promise<Booking[]> {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM bookings WHERE user_id = ? ORDER BY booking_date DESC',
        [userId],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows as Booking[]);
          }
        }
      );
    });
  }

  // Get equipment bookings
  static async findByEquipmentId(equipmentId: number): Promise<Booking[]> {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM bookings WHERE equipment_id = ? ORDER BY start_date ASC',
        [equipmentId],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows as Booking[]);
          }
        }
      );
    });
  }

  // Check if equipment is available for the given dates
  static async isEquipmentAvailable(equipmentId: number, startDate: string, endDate: string, excludeBookingId?: number): Promise<boolean> {
    const query = `
      SELECT COUNT(*) as count FROM bookings 
      WHERE equipment_id = ? 
        AND status = 'active' 
        AND ((start_date BETWEEN ? AND ?) OR (end_date BETWEEN ? AND ?) OR (start_date <= ? AND end_date >= ?))
        ${excludeBookingId ? 'AND id != ?' : ''}
    `;
    
    const params = [
      equipmentId,
      startDate, endDate,
      startDate, endDate,
      startDate, endDate
    ];
    
    if (excludeBookingId) {
      params.push(excludeBookingId);
    }
    
    return new Promise((resolve, reject) => {
      db.get(query, params, (err, row: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(row.count === 0);
        }
      });
    });
  }

  // Update booking status
  static async updateStatus(id: number, status: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE bookings SET status = ? WHERE id = ?',
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

  // Get active bookings
  static async findActiveBookings(): Promise<Booking[]> {
    return new Promise((resolve, reject) => {
      db.all(
        "SELECT * FROM bookings WHERE status = 'active' ORDER BY start_date ASC",
        [],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows as Booking[]);
          }
        }
      );
    });
  }

  // Get completed bookings
  static async findCompletedBookings(): Promise<Booking[]> {
    return new Promise((resolve, reject) => {
      db.all(
        "SELECT * FROM bookings WHERE status = 'completed' ORDER BY end_date DESC",
        [],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows as Booking[]);
          }
        }
      );
    });
  }

  // Get bookings for calendar (with extended information)
  static async getBookingsWithDetails(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT b.*, e.name as equipment_name, u.email as user_email 
         FROM bookings b
         JOIN equipment e ON b.equipment_id = e.id
         JOIN users u ON b.user_id = u.id
         ORDER BY b.start_date ASC`,
        [],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        }
      );
    });
  }
} 