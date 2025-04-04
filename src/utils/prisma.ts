import { PrismaClient } from '@prisma/client';

// Инициализация Prisma
export const prisma = new PrismaClient();

// Обработка закрытия соединения с базой данных при выходе
process.on('exit', () => {
  prisma.$disconnect();
});

// Обработка ошибок и сигналов завершения
process.on('SIGINT', () => {
  prisma.$disconnect();
  process.exit(0);
});

export default prisma; 