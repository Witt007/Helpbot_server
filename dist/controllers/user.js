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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.setupUserController = void 0;
const userService = __importStar(require("../services/user"));
const setupUserController = (app) => {
    // 创建用户
    app.post('/users', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { username, email } = req.body;
            const userId = yield userService.createUser(username, email);
            res.status(201).json({ userId, message: 'User created successfully' });
        }
        catch (error) {
            console.error('Error creating user:', error);
            res.status(500).json({ error: 'Failed to create user' });
        }
    }));
    // 获取用户
    app.get('/users/:userId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const userId = req.params.userId;
            const user = yield userService.getUserById(userId);
            if (user) {
                res.json(user);
            }
            else {
                res.status(404).json({ message: 'User not found' });
            }
        }
        catch (error) {
            console.error('Error getting user:', error);
            res.status(500).json({ error: 'Failed to get user' });
        }
    }));
    // 更新用户
    app.put('/users/:userId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const userId = req.params.userId;
            const { username, email } = req.body;
            yield userService.updateUser(userId, username, email);
            res.json({ message: 'User updated successfully' });
        }
        catch (error) {
            console.error('Error updating user:', error);
            res.status(500).json({ error: 'Failed to update user' });
        }
    }));
    // 删除用户
    app.delete('/users/:userId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const userId = req.params.userId;
            yield userService.deleteUser(userId);
            res.json({ message: 'User deleted successfully' });
        }
        catch (error) {
            console.error('Error deleting user:', error);
            res.status(500).json({ error: 'Failed to delete user' });
        }
    }));
    // 获取所有用户
    app.get('/users', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const users = yield userService.getAllUsers();
            res.json(users);
        }
        catch (error) {
            console.error('Error getting all users:', error);
            res.status(500).json({ error: 'Failed to get users' });
        }
    }));
    // ... 用户登录，登出等路由
};
exports.setupUserController = setupUserController;
