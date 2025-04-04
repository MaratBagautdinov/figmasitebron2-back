import { UserModel } from './models/User';
import { initializeDatabase } from './db/init';
import bcrypt from 'bcrypt';

async function createAdmin() {
  await initializeDatabase();

  const email = 'admin';
  const password = '17072020';

  // Хешируем пароль
  const hashedPassword = await bcrypt.hash(password, 10);

  const existingUser = await UserModel.findByEmail(email);

  if (existingUser) {
    // Обновляем существующего пользователя
    await UserModel.confirmEmail(email);
    await UserModel.updatePassword(existingUser.id as number, password);

    // Устанавливаем роль администратора (если не установлена)
    if (existingUser.role !== 'admin') {
      // Примечание: В текущей модели нет метода обновления роли,
      // поэтому используем прямой SQL-запрос
      const db = (await import('./db/init')).default;
      await new Promise<void>((resolve, reject) => {
        db.run(
          'UPDATE users SET role = ? WHERE email = ?',
          ['admin', email],
          function (err) {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          }
        );
      });
    }

    console.log('Администратор уже существует. Учетные данные обновлены.');
  } else {
    // Создаем нового администратора
    await UserModel.create({
      email,
      password: hashedPassword,
      is_confirmed: true,
      role: 'admin'
    });
    console.log('Администратор создан успешно.');
  }

  console.log('Данные для входа в админ-панель:');
  console.log('Логин: admin');
  console.log('Пароль: 17072020');
}

createAdmin().catch(console.error); 