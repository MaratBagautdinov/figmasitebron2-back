"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
// Инициализация Prisma
exports.prisma = new client_1.PrismaClient();
// Обработка закрытия соединения с базой данных при выходе
process.on('exit', () => {
    exports.prisma.$disconnect();
});
// Обработка ошибок и сигналов завершения
process.on('SIGINT', () => {
    exports.prisma.$disconnect();
    process.exit(0);
});
exports.default = exports.prisma;
