"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBookingData = exports.validateDateTimeFormat = void 0;
/**
 * Валидация даты и времени
 */
const validateDateTimeFormat = (dateStr, timeStr) => {
    // Проверка формата даты ДД.ММ.ГГГГ
    const dateRegex = /^(\d{2})\.(\d{2})\.(\d{4})$/;
    if (!dateRegex.test(dateStr))
        return false;
    // Проверка формата времени ЧЧ:ММ
    const timeRegex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/;
    if (!timeRegex.test(timeStr))
        return false;
    // Разбор даты
    const [, day, month, year] = dateRegex.exec(dateStr) || [];
    const numDay = parseInt(day, 10);
    const numMonth = parseInt(month, 10);
    const numYear = parseInt(year, 10);
    // Проверка допустимости месяца
    if (numMonth < 1 || numMonth > 12)
        return false;
    // Проверка количества дней в месяце
    const daysInMonth = new Date(numYear, numMonth, 0).getDate();
    if (numDay < 1 || numDay > daysInMonth)
        return false;
    return true;
};
exports.validateDateTimeFormat = validateDateTimeFormat;
/**
 * Валидация данных бронирования
 */
const validateBookingData = (data) => {
    const { startDate, startTime, endDate, endTime, equipmentItems } = data;
    // Проверка наличия обязательных полей
    if (!startDate || !startTime || !endDate || !endTime) {
        return {
            valid: false,
            message: 'Необходимо указать дату и время начала и окончания аренды'
        };
    }
    if (!equipmentItems || !Array.isArray(equipmentItems) || equipmentItems.length === 0) {
        return {
            valid: false,
            message: 'Необходимо выбрать оборудование для аренды'
        };
    }
    // Проверка формата даты и времени
    if (!(0, exports.validateDateTimeFormat)(startDate, startTime)) {
        return {
            valid: false,
            message: 'Некорректный формат даты или времени начала аренды'
        };
    }
    if (!(0, exports.validateDateTimeFormat)(endDate, endTime)) {
        return {
            valid: false,
            message: 'Некорректный формат даты или времени окончания аренды'
        };
    }
    // Преобразование дат для сравнения
    const [startDay, startMonth, startYear] = startDate.split('.').map(Number);
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endDay, endMonth, endYear] = endDate.split('.').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    const startDateTime = new Date(startYear, startMonth - 1, startDay, startHour, startMinute);
    const endDateTime = new Date(endYear, endMonth - 1, endDay, endHour, endMinute);
    const now = new Date();
    // Проверка, что дата начала не в прошлом
    if (startDateTime < now) {
        return {
            valid: false,
            message: 'Дата начала аренды не может быть в прошлом'
        };
    }
    // Проверка, что дата окончания позже даты начала
    if (endDateTime <= startDateTime) {
        return {
            valid: false,
            message: 'Дата окончания должна быть позже даты начала аренды'
        };
    }
    // Проверка ID оборудования в каждом элементе
    for (const item of equipmentItems) {
        if (!item.id || typeof item.id !== 'number') {
            return {
                valid: false,
                message: 'Некорректный ID оборудования'
            };
        }
        if (item.quantity && (typeof item.quantity !== 'number' || item.quantity <= 0)) {
            return {
                valid: false,
                message: 'Количество должно быть положительным числом'
            };
        }
    }
    return { valid: true, message: '' };
};
exports.validateBookingData = validateBookingData;
