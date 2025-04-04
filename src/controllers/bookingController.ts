import { Request, Response } from 'express';
import { BookingModel, Booking } from '../models/Booking';
import { EquipmentModel } from '../models/Equipment';
import { UserModel } from '../models/User';
import { AuthRequest } from '../middleware/auth';
import emailService from '../config/emailService';
import { prisma } from '../utils/prisma';
import { validateBookingData } from '../utils/validation';
import { CustomRequest } from '../types/express';

// Get all bookings (admin only)
export const getAllBookings = async (req: Request, res: Response) => {
  try {
    const { status, startDate, endDate } = req.query;
    
    // Формируем фильтр
    const filter: any = {};
    
    if (status) {
      filter.status = status;
    }
    
    if (startDate && endDate) {
      filter.OR = [
        {
          startDate: {
            gte: new Date(startDate as string),
            lte: new Date(endDate as string)
          }
        },
        {
          endDate: {
            gte: new Date(startDate as string),
            lte: new Date(endDate as string)
          }
        }
      ];
    }
    
    const bookings = await prisma.booking.findMany({
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
  } catch (error) {
    console.error('Ошибка при получении всех бронирований:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Произошла ошибка при получении бронирований' 
    });
  }
};

// Get booking by ID
export const getBookingById = async (req: CustomRequest, res: Response) => {
  try {
    const bookingId = Number(req.params.id);
    const userId = req.user?.id;
    const isUserAdmin = req.user?.role === 'ADMIN';
    
    if (isNaN(bookingId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Некорректный ID бронирования' 
      });
    }
    
    const booking = await prisma.booking.findUnique({
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
  } catch (error) {
    console.error('Ошибка при получении информации о бронировании:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Произошла ошибка при получении информации о бронировании' 
    });
  }
};

// Get user's bookings
export const getUserBookings = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Необходима авторизация' 
      });
    }
    
    const bookings = await prisma.booking.findMany({
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
  } catch (error) {
    console.error('Ошибка при получении бронирований пользователя:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Произошла ошибка при получении бронирований' 
    });
  }
};

// Create a new booking
export const createBooking = async (req: CustomRequest, res: Response) => {
  try {
    const { startDate, startTime, endDate, endTime, equipmentItems, eventType, comment } = req.body;
    
    // Проверка входных данных
    const validation = validateBookingData(req.body);
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
    const booking = await prisma.booking.create({
      data: {
        userId: req.user?.id as number, // ID пользователя из токена
        startDate: startDateTime,
        endDate: endDateTime,
        status: 'PENDING',
        eventType,
        comment,
        equipmentItems: {
          create: equipmentItems.map((item: any) => ({
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
  } catch (error) {
    console.error('Ошибка при создании бронирования:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Произошла ошибка при создании бронирования' 
    });
  }
};

// Update booking status
export const updateBooking = async (req: CustomRequest, res: Response) => {
  try {
    const bookingId = Number(req.params.id);
    const userId = req.user?.id;
    const isUserAdmin = req.user?.role === 'ADMIN';
    
    if (isNaN(bookingId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Некорректный ID бронирования' 
      });
    }
    
    // Получаем текущее бронирование
    const existingBooking = await prisma.booking.findUnique({
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
    const updateData: any = {};
    
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
    const updatedBooking = await prisma.booking.update({
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
  } catch (error) {
    console.error('Ошибка при обновлении бронирования:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Произошла ошибка при обновлении бронирования' 
    });
  }
};

// Get all active bookings
export const getActiveBookings = async (_req: Request, res: Response) => {
  try {
    const bookings = await BookingModel.findActiveBookings();
    res.status(200).json(bookings);
  } catch (error) {
    console.error('Error fetching active bookings:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Get all completed bookings
export const getCompletedBookings = async (_req: Request, res: Response) => {
  try {
    const bookings = await BookingModel.findCompletedBookings();
    res.status(200).json(bookings);
  } catch (error) {
    console.error('Error fetching completed bookings:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Get bookings for calendar view (with extended info)
export const getCalendarBookings = async (_req: Request, res: Response) => {
  try {
    const bookings = await BookingModel.getBookingsWithDetails();
    
    // Format for calendar view
    const calendarData = bookings.map((booking: any) => ({
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
  } catch (error) {
    console.error('Error fetching calendar bookings:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Проверка доступности оборудования на указанные даты
export const checkAvailability = async (req: Request, res: Response) => {
  try {
    const { equipmentId, startDate, endDate } = req.query;
    
    if (!equipmentId || !startDate || !endDate) {
      return res.status(400).json({ 
        success: false, 
        message: 'Необходимо указать equipmentId, startDate и endDate' 
      });
    }
    
    // Преобразуем строки в даты
    const start = new Date(startDate as string);
    const end = new Date(endDate as string);
    
    // Проверяем, есть ли перекрывающиеся бронирования
    const overlappingBookings = await prisma.booking.findMany({
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
    
  } catch (error) {
    console.error('Ошибка при проверке доступности:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Произошла ошибка при проверке доступности' 
    });
  }
};

// Отмена бронирования
export const cancelBooking = async (req: CustomRequest, res: Response) => {
  try {
    const bookingId = Number(req.params.id);
    const userId = req.user?.id;
    const isUserAdmin = req.user?.role === 'ADMIN';
    
    if (isNaN(bookingId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Некорректный ID бронирования' 
      });
    }
    
    // Получаем текущее бронирование
    const existingBooking = await prisma.booking.findUnique({
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
    const canceledBooking = await prisma.booking.update({
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
    
  } catch (error) {
    console.error('Ошибка при отмене бронирования:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Произошла ошибка при отмене бронирования' 
    });
  }
}; 