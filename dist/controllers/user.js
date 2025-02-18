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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupUserController = void 0;
const WxUserService_1 = require("../services/WxUserService");
const userService = __importStar(require("../services/user"));
const axios_1 = __importDefault(require("axios"));
const setupUserController = (app) => {
    // 创建用户
    app.post('/users', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { avatarUrl } = req.body;
            const openId = req.headers['x-wx-openid'];
            const userId = yield WxUserService_1.WxUserService.getInstance().loginUser(openId, avatarUrl);
            res.status(201).json({ userId, message: 'User created successfully' });
        }
        catch (error) {
            console.error('Error creating user:', error);
            res.status(500).json({ error: 'Failed to create user' });
        }
    }));
    // 获取用户
    app.get('/users', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const openId = req.headers['x-wx-openid'];
            const user = yield WxUserService_1.WxUserService.getInstance().findUserByOpenId(openId);
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
    app.put('/users', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const openId = req.headers['x-wx-openid'];
            const { code } = req.body;
            let phonenumber = '';
            let success = false;
            if (code) {
                if (code) {
                    try {
                        const wxPhoneApiUrl = `https://api.weixin.qq.com/wxa/business/getuserphonenumber?code=${code}`; // Replace with the actual API URL.
                        const response = yield axios_1.default.get(wxPhoneApiUrl);
                        console.log('getphonenum', response.data);
                        if (response.data.errmsg == 'ok') {
                            phonenumber = response.data.phone_info.phoneNumber || ''; // Update 'phoneNumber' based on API response structure.
                            yield WxUserService_1.WxUserService.getInstance().updateUserPhone(openId, phonenumber);
                            success = true;
                        }
                    }
                    catch (e) {
                        console.log(e);
                    }
                }
            }
            res.json({ success });
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
