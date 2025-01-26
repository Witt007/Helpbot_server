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
exports.getAllUsers = exports.deleteUser = exports.updateUser = exports.getUserById = exports.createUser = void 0;
const db_1 = __importDefault(require("../database/db"));
const createUser = (username, email) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = generateUniqueId(); //  需要实现 generateUniqueId 函数
    yield db_1.default.query('INSERT INTO users (id, username, email, created_at) VALUES (?, ?, ?, NOW())', [userId, username, email]);
    return userId;
});
exports.createUser = createUser;
const getUserById = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield db_1.default.query('SELECT * FROM users WHERE id = ?', [userId]);
    return users[0];
});
exports.getUserById = getUserById;
const updateUser = (userId, username, email) => __awaiter(void 0, void 0, void 0, function* () {
    yield db_1.default.query('UPDATE users SET username = ?, email = ? WHERE id = ?', [username, email, userId]);
});
exports.updateUser = updateUser;
const deleteUser = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    yield db_1.default.query('DELETE FROM users WHERE id = ?', [userId]);
});
exports.deleteUser = deleteUser;
const getAllUsers = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield db_1.default.query('SELECT * FROM users');
});
exports.getAllUsers = getAllUsers;
//  简易的 UUID 生成函数，实际应用中可以使用更完善的 UUID 库 (如果 message.ts 中没有定义，这里也需要)
const generateUniqueId = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};
// ... 用户登录，session 管理等服务逻辑 
