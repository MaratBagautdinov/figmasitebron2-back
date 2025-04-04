"use strict";
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
exports.BookingModel = void 0;
const init_1 = __importDefault(require("../db/init"));
class BookingModel {
    // Create a new booking
    static create(bookingData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { user_id, equipment_id, start_date, start_time, rental_days, end_date, status } = bookingData;
            return new Promise((resolve, reject) => {
                init_1.default.run('INSERT INTO bookings (user_id, equipment_id, start_date, start_time, rental_days, end_date, status) VALUES (?, ?, ?, ?, ?, ?, ?)', [user_id, equipment_id, start_date, start_time, rental_days, end_date, status || 'active'], function (err) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(this.lastID);
                    }
                });
            });
        });
    }
    // Get all bookings
    static findAll() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                init_1.default.all('SELECT * FROM bookings ORDER BY booking_date DESC', [], (err, rows) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(rows);
                    }
                });
            });
        });
    }
    // Get booking by ID
    static findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                init_1.default.get('SELECT * FROM bookings WHERE id = ?', [id], (err, row) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(row || null);
                    }
                });
            });
        });
    }
    // Get user bookings
    static findByUserId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                init_1.default.all('SELECT * FROM bookings WHERE user_id = ? ORDER BY booking_date DESC', [userId], (err, rows) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(rows);
                    }
                });
            });
        });
    }
    // Get equipment bookings
    static findByEquipmentId(equipmentId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                init_1.default.all('SELECT * FROM bookings WHERE equipment_id = ? ORDER BY start_date ASC', [equipmentId], (err, rows) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(rows);
                    }
                });
            });
        });
    }
    // Check if equipment is available for the given dates
    static isEquipmentAvailable(equipmentId, startDate, endDate, excludeBookingId) {
        return __awaiter(this, void 0, void 0, function* () {
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
                init_1.default.get(query, params, (err, row) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(row.count === 0);
                    }
                });
            });
        });
    }
    // Update booking status
    static updateStatus(id, status) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                init_1.default.run('UPDATE bookings SET status = ? WHERE id = ?', [status, id], function (err) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(this.changes > 0);
                    }
                });
            });
        });
    }
    // Get active bookings
    static findActiveBookings() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                init_1.default.all("SELECT * FROM bookings WHERE status = 'active' ORDER BY start_date ASC", [], (err, rows) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(rows);
                    }
                });
            });
        });
    }
    // Get completed bookings
    static findCompletedBookings() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                init_1.default.all("SELECT * FROM bookings WHERE status = 'completed' ORDER BY end_date DESC", [], (err, rows) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(rows);
                    }
                });
            });
        });
    }
    // Get bookings for calendar (with extended information)
    static getBookingsWithDetails() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                init_1.default.all(`SELECT b.*, e.name as equipment_name, u.email as user_email 
         FROM bookings b
         JOIN equipment e ON b.equipment_id = e.id
         JOIN users u ON b.user_id = u.id
         ORDER BY b.start_date ASC`, [], (err, rows) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(rows);
                    }
                });
            });
        });
    }
}
exports.BookingModel = BookingModel;
