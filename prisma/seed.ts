import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Создаем тестового пользователя
  const testUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      password: await bcrypt.hash('password123', 10),
      firstName: 'Test',
      lastName: 'User',
      phone: '+79991234567',
      is_confirmed: true,
      role: 'ADMIN'
    }
  });
  
  console.log({ testUser });
  
  // Создаем категории
  const categoryTools = await prisma.category.create({
    data: {
      name: 'Инструменты',
      description: 'Строительные инструменты и электроинструменты'
    }
  });
  
  const categoryAudio = await prisma.category.create({
    data: {
      name: 'Аудио',
      description: 'Аудиооборудование и микрофоны'
    }
  });
  
  console.log({ categoryTools, categoryAudio });
  
  // Создаем оборудование
  const equipment1 = await prisma.equipment.create({
    data: {
      name: 'Дрель Bosch',
      description: 'Мощная дрель для строительных работ',
      categoryId: categoryTools.id,
      status: 'AVAILABLE'
    }
  });
  
  const equipment2 = await prisma.equipment.create({
    data: {
      name: 'Микрофон Shure SM58',
      description: 'Профессиональный вокальный микрофон',
      categoryId: categoryAudio.id,
      status: 'AVAILABLE'
    }
  });
  
  console.log({ equipment1, equipment2 });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  }); 