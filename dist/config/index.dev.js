"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    db: {
        host: process.env.MYSQL_HOST || 'sh-cynosdbmysql-grp-mu25vuwk.sql.tencentcdb.com',
        port: parseInt(process.env.MYSQL_PORT || '25263'),
        user: process.env.MYSQL_USER || 'witt',
        password: process.env.MYSQL_PASSWORD || 'Robertwitt2019',
        database: process.env.MYSQL_DATABASE || 'helpbot_db',
        timezone: '+08:00'
    },
    dify: {
        apiKey: process.env.DIFY_API_KEY || 'app-hoBJ5ZkJNuv7L3JwSBWUjqbV',
        apiUrl: process.env.DIFY_API_BASE_URL || 'http://1.13.176.116:888/v1',
    },
    wx: {
        appId: process.env.WX_APP_ID || 'your_app_id',
        appSecret: process.env.WX_APP_SECRET || 'your_app_secret'
    },
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'your-secret-key',
        expiresIn: '7d', // token 有效期
    },
    // ... 其他配置
};
