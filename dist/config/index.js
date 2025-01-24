"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    mysql: {
        host: process.env.MYSQL_HOST || 'localhost',
        port: parseInt(process.env.MYSQL_PORT || '3306'),
        user: process.env.MYSQL_USER || 'root',
        password: process.env.MYSQL_PASSWORD || 'witt',
        database: process.env.MYSQL_DATABASE || 'helpbot_db',
    },
    dify: {
        apiKey: process.env.DIFY_API_KEY || 'app-hoBJ5ZkJNuv7L3JwSBWUjqbV',
        apiUrl: process.env.DIFY_API_URL || 'http://1.13.176.116:888/v1',
    },
    // ... 其他配置
};
