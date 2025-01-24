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
exports.query = exports.getMysqlPool = exports.initMysql = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
const config_1 = require("../config");
let pool;
const initMysql = () => __awaiter(void 0, void 0, void 0, function* () {
    pool = promise_1.default.createPool(config_1.config.mysql);
    try {
        yield pool.getConnection();
        console.log('MySQL database connected');
    }
    catch (error) {
        console.error('Failed to connect to MySQL database:', error);
    }
});
exports.initMysql = initMysql;
const getMysqlPool = () => {
    if (!pool) {
        throw new Error('MySQL pool not initialized');
    }
    return pool;
};
exports.getMysqlPool = getMysqlPool;
// 封装常用的数据库操作，例如 query
const query = (sql, values) => __awaiter(void 0, void 0, void 0, function* () {
    const connection = yield pool.getConnection();
    try {
        const [rows] = yield connection.query(sql, values);
        return rows;
    }
    finally {
        connection.release(); // 释放连接回连接池
    }
});
exports.query = query;
