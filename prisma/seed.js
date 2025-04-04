"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
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
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        // Создаем тестового пользователя
        const testUser = yield prisma.user.upsert({
            where: { email: 'test@example.com' },
            update: {},
            create: {
                email: 'test@example.com',
                password: yield bcrypt.hash('password123', 10),
                firstName: 'Test',
                lastName: 'User',
                phone: '+79991234567',
                is_confirmed: true,
                role: 'ADMIN'
            }
        });
        console.log({ testUser });
        // Создаем категории
        const categoryTools = yield prisma.category.create({
            data: {
                name: 'Инструменты',
                description: 'Строительные инструменты и электроинструменты'
            }
        });
        const categoryAudio = yield prisma.category.create({
            data: {
                name: 'Аудио',
                description: 'Аудиооборудование и микрофоны'
            }
        });
        console.log({ categoryTools, categoryAudio });
        // Создаем оборудование
        const equipment1 = yield prisma.equipment.create({
            data: {
                name: 'Дрель Bosch',
                description: 'Мощная дрель для строительных работ',
                categoryId: categoryTools.id,
                status: 'AVAILABLE'
            }
        });
        const equipment2 = yield prisma.equipment.create({
            data: {
                name: 'Микрофон Shure SM58',
                description: 'Профессиональный вокальный микрофон',
                categoryId: categoryAudio.id,
                status: 'AVAILABLE'
            }
        });
        console.log({ equipment1, equipment2 });
    });
}
main()
    .then(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
}))
    .catch((e) => __awaiter(void 0, void 0, void 0, function* () {
    console.error(e);
    yield prisma.$disconnect();
    process.exit(1);
}));
