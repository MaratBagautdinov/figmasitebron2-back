"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function (o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function () { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function (o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function (o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function (o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function (o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const User_1 = require("./models/User");
const init_1 = require("./db/init");
const bcrypt_1 = __importDefault(require("bcrypt"));
function createAdmin() {
    return __awaiter(this, void 0, void 0, function* () {
        yield (0, init_1.initializeDatabase)();
        const email = 'admin';
        const password = '17072020';
        // Хешируем пароль
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const existingUser = yield User_1.UserModel.findByEmail(email);
        if (existingUser) {
            // Обновляем существующего пользователя
            yield User_1.UserModel.confirmEmail(email);
            yield User_1.UserModel.updatePassword(existingUser.id, password);
            // Устанавливаем роль администратора (если не установлена)
            if (existingUser.role !== 'admin') {
                // Примечание: В текущей модели нет метода обновления роли,
                // поэтому используем прямой SQL-запрос
                const db = (yield Promise.resolve().then(() => __importStar(require('./db/init')))).default;
                yield new Promise((resolve, reject) => {
                    db.run('UPDATE users SET role = ? WHERE email = ?', ['admin', email], function (err) {
                        if (err) {
                            reject(err);
                        }
                        else {
                            resolve();
                        }
                    });
                });
            }
            console.log('Администратор уже существует. Учетные данные обновлены.');
        }
        else {
            // Создаем нового администратора
            yield User_1.UserModel.create({
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
    });
}
createAdmin().catch(console.error);
