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
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelBooking = exports.checkAvailability = exports.getCalendarBookings = exports.getCompletedBookings = exports.getActiveBookings = exports.updateBooking = exports.createBooking = exports.getUserBookings = exports.getBookingById = exports.getAllBookings = void 0;
const Booking_1 = require("../models/Booking");
const prisma_1 = require("../utils/prisma");
const validation_1 = require("../utils/validation");
// Get all bookings (admin only)
const getAllBookings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status, startDate, endDate } = req.query;
        // Формируем фильтр
        const filter = {};
        if (status) {
            filter.status = status;
        }
        if (startDate && endDate) {
            filter.OR = [
                {
                    startDate: {
                        gte: new Date(startDate),
                        lte: new Date(endDate)
                    }
                },
                {
                    endDate: {
                        gte: new Date(startDate),
                        lte: new Date(endDate)
                    }
                }
            ];
        }
        const bookings = yield prisma_1.prisma.booking.findMany({
            where: filter,
            orderBy: {
                startDate: 'asc'
            },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true
                    }
                },
                equipmentItems: {
                    include: {
                        equipment: true
                    }
                }
            }
        });
        return res.json({
            success: true,
            bookings
        });
    }
    catch (error) {
        console.error('Ошибка при получении всех бронирований:', error);
        return res.status(500).json({
            success: false,
            message: 'Произошла ошибка при получении бронирований'
        });
    }
});
exports.getAllBookings = getAllBookings;
// Get booking by ID
const getBookingById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const bookingId = Number(req.params.id);
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const isUserAdmin = ((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) === 'ADMIN';
        if (isNaN(bookingId)) {
            return res.status(400).json({
                success: false,
                message: 'Некорректный ID бронирования'
            });
        }
        const booking = yield prisma_1.prisma.booking.findUnique({
            where: {
                id: bookingId
            },
            include: {
                equipmentItems: {
                    include: {
                        equipment: true
                    }
                },
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true
                    }
                }
            }
        });
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Бронирование не найдено'
            });
        }
        // Проверяем права доступа: админ или владелец бронирования
        if (!isUserAdmin && booking.userId !== userId) {
            return res.status(403).json({
                success: false,
                message: 'У вас нет доступа к этому бронированию'
            });
        }
        return res.json({
            success: true,
            booking
        });
    }
    catch (error) {
        console.error('Ошибка при получении информации о бронировании:', error);
        return res.status(500).json({
            success: false,
            message: 'Произошла ошибка при получении информации о бронировании'
        });
    }
});
exports.getBookingById = getBookingById;
// Get user's bookings
const getUserBookings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Необходима авторизация'
            });
        }
        const bookings = yield prisma_1.prisma.booking.findMany({
            where: {
                userId
            },
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                equipmentItems: {
                    include: {
                        equipment: true
                    }
                }
            }
        });
        return res.json({
            success: true,
            bookings
        });
    }
    catch (error) {
        console.error('Ошибка при получении бронирований пользователя:', error);
        return res.status(500).json({
            success: false,
            message: 'Произошла ошибка при получении бронирований'
        });
    }
});
exports.getUserBookings = getUserBookings;
// Create a new booking
const createBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { startDate, startTime, endDate, endTime, equipmentItems, eventType, comment } = req.body;
        // Проверка входных данных
        const validation = (0, validation_1.validateBookingData)(req.body);
        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                message: validation.message
            });
        }
        // Объединяем дату и время в объекты Date
        const startDateTime = new Date(`${startDate}T${startTime}`);
        const endDateTime = new Date(`${endDate}T${endTime}`);
        // Создаем новое бронирование
        const booking = yield prisma_1.prisma.booking.create({
            data: {
                userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id, // ID пользователя из токена
                startDate: startDateTime,
                endDate: endDateTime,
                status: 'PENDING',
                eventType,
                comment,
                equipmentItems: {
                    create: equipmentItems.map((item) => ({
                        equipment: {
                            connect: { id: item.id }
                        },
                        quantity: item.quantity || 1
                    }))
                }
            },
            include: {
                equipmentItems: {
                    include: {
                        equipment: true
                    }
                }
            }
        });
        return res.status(201).json({
            success: true,
            message: 'Бронирование успешно создано',
            booking
        });
    }
    catch (error) {
        console.error('Ошибка при создании бронирования:', error);
        return res.status(500).json({
            success: false,
            message: 'Произошла ошибка при создании бронирования'
        });
    }
});
exports.createBooking = createBooking;
// Update booking status
const updateBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const bookingId = Number(req.params.id);
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const isUserAdmin = ((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) === 'ADMIN';
        if (isNaN(bookingId)) {
            return res.status(400).json({
                success: false,
                message: 'Некорректный ID бронирования'
            });
        }
        // Получаем текущее бронирование
        const existingBooking = yield prisma_1.prisma.booking.findUnique({
            where: {
                id: bookingId
            }
        });
        if (!existingBooking) {
            return res.status(404).json({
                success: false,
                message: 'Бронирование не найдено'
            });
        }
        // Проверяем права доступа: админ или владелец бронирования
        if (!isUserAdmin && existingBooking.userId !== userId) {
            return res.status(403).json({
                success: false,
                message: 'У вас нет прав на редактирование этого бронирования'
            });
        }
        // Подготавливаем данные для обновления
        const updateData = {};
        if (req.body.startDate && req.body.startTime) {
            updateData.startDate = new Date(`${req.body.startDate}T${req.body.startTime}`);
        }
        if (req.body.endDate && req.body.endTime) {
            updateData.endDate = new Date(`${req.body.endDate}T${req.body.endTime}`);
        }
        if (req.body.eventType) {
            updateData.eventType = req.body.eventType;
        }
        if (req.body.comment !== undefined) {
            updateData.comment = req.body.comment;
        }
        // Только администратор может изменить статус
        if (isUserAdmin && req.body.status) {
            updateData.status = req.body.status;
        }
        // Обновляем бронирование
        const updatedBooking = yield prisma_1.prisma.booking.update({
            where: {
                id: bookingId
            },
            data: updateData,
            include: {
                equipmentItems: {
                    include: {
                        equipment: true
                    }
                }
            }
        });
        return res.json({
            success: true,
            message: 'Бронирование успешно обновлено',
            booking: updatedBooking
        });
    }
    catch (error) {
        console.error('Ошибка при обновлении бронирования:', error);
        return res.status(500).json({
            success: false,
            message: 'Произошла ошибка при обновлении бронирования'
        });
    }
});
exports.updateBooking = updateBooking;
// Get all active bookings
const getActiveBookings = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bookings = yield Booking_1.BookingModel.findActiveBookings();
        res.status(200).json(bookings);
    }
    catch (error) {
        console.error('Error fetching active bookings:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});
exports.getActiveBookings = getActiveBookings;
// Get all completed bookings
const getCompletedBookings = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bookings = yield Booking_1.BookingModel.findCompletedBookings();
        res.status(200).json(bookings);
    }
    catch (error) {
        console.error('Error fetching completed bookings:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});
exports.getCompletedBookings = getCompletedBookings;
// Get bookings for calendar view (with extended info)
const getCalendarBookings = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bookings = yield Booking_1.BookingModel.getBookingsWithDetails();
        // Format for calendar view
        const calendarData = bookings.map((booking) => ({
            id: booking.id,
            title: `${booking.equipment_name} - ${booking.user_email}`,
            start: booking.start_date,
            end: booking.end_date,
            color: booking.status === 'active' ? '#f44336' : '#4CAF50', // Red for active, green for completed
            status: booking.status,
            equipment_id: booking.equipment_id,
            equipment_name: booking.equipment_name,
            user_id: booking.user_id,
            user_email: booking.user_email
        }));
        res.status(200).json(calendarData);
    }
    catch (error) {
        console.error('Error fetching calendar bookings:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});
exports.getCalendarBookings = getCalendarBookings;
// Проверка доступности оборудования на указанные даты
const checkAvailability = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { equipmentId, startDate, endDate } = req.query;
        if (!equipmentId || !startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'Необходимо указать equipmentId, startDate и endDate'
            });
        }
        // Преобразуем строки в даты
        const start = new Date(startDate);
        const end = new Date(endDate);
        // Проверяем, есть ли перекрывающиеся бронирования
        const overlappingBookings = yield prisma_1.prisma.booking.findMany({
            where: {
                equipmentItems: {
                    some: {
                        equipmentId: Number(equipmentId)
                    }
                },
                status: {
                    in: ['CONFIRMED', 'PENDING']
                },
                OR: [
                    {
                        // Начало бронирования находится в запрашиваемом периоде
                        startDate: {
                            gte: start,
                            lte: end
                        }
                    },
                    {
                        // Конец бронирования находится в запрашиваемом периоде
                        endDate: {
                            gte: start,
                            lte: end
                        }
                    },
                    {
                        // Бронирование полностью охватывает запрашиваемый период
                        AND: [
                            { startDate: { lte: start } },
                            { endDate: { gte: end } }
                        ]
                    }
                ]
            }
        });
        const isAvailable = overlappingBookings.length === 0;
        return res.json({
            success: true,
            isAvailable,
            overlappingBookings: isAvailable ? [] : overlappingBookings
        });
    }
    catch (error) {
        console.error('Ошибка при проверке доступности:', error);
        return res.status(500).json({
            success: false,
            message: 'Произошла ошибка при проверке доступности'
        });
    }
});
exports.checkAvailability = checkAvailability;
// Отмена бронирования
const cancelBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const bookingId = Number(req.params.id);
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const isUserAdmin = ((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) === 'ADMIN';
        if (isNaN(bookingId)) {
            return res.status(400).json({
                success: false,
                message: 'Некорректный ID бронирования'
            });
        }
        // Получаем текущее бронирование
        const existingBooking = yield prisma_1.prisma.booking.findUnique({
            where: {
                id: bookingId
            }
        });
        if (!existingBooking) {
            return res.status(404).json({
                success: false,
                message: 'Бронирование не найдено'
            });
        }
        // Проверяем права доступа: админ или владелец бронирования
        if (!isUserAdmin && existingBooking.userId !== userId) {
            return res.status(403).json({
                success: false,
                message: 'У вас нет прав на отмену этого бронирования'
            });
        }
        // Отменяем бронирование (изменяем статус)
        const canceledBooking = yield prisma_1.prisma.booking.update({
            where: {
                id: bookingId
            },
            data: {
                status: 'CANCELLED'
            }
        });
        return res.json({
            success: true,
            message: 'Бронирование успешно отменено',
            booking: canceledBooking
        });
    }
    catch (error) {
        console.error('Ошибка при отмене бронирования:', error);
        return res.status(500).json({
            success: false,
            message: 'Произошла ошибка при отмене бронирования'
        });
    }
});
exports.cancelBooking = cancelBooking;
