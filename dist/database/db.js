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
exports.initDatabase = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
const config_1 = require("../config");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class Database {
    constructor() {
        this.pool = promise_1.default.createPool({
            host: config_1.config.db.host,
            port: config_1.config.db.port,
            user: config_1.config.db.user,
            password: config_1.config.db.password,
            timezone: config_1.config.db.timezone,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });
    }
    static getInstance() {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }
    getPool() {
        return this.pool;
    }
    dropDatabase() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.pool.query(`DROP DATABASE ${config_1.config.db.database}`);
        });
    }
    query(sql, values) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.useDB();
                const result = yield this.pool.execute(sql, values);
                return result;
            }
            catch (error) {
                console.error('SQL Error:', error);
            }
            return [[], null];
        });
    }
    transaction(callback) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield this.pool.getConnection();
            yield connection.beginTransaction();
            try {
                const result = yield callback(connection);
                yield connection.commit();
                return result;
            }
            catch (error) {
                yield connection.rollback();
                throw error;
            }
            finally {
                connection.release();
            }
        });
    }
    useDB() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.pool.query(`USE ${config_1.config.db.database}`);
        });
    }
    // 初始化数据库
    initDatabase() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // 创建数据库（如果不存在）
                yield this.createDatabaseIfNotExists();
                // 连接到指定的数据库
                yield this.useDB();
                // 读取并执行初始化SQL文件
                yield this.executeMigrations();
                console.log('数据库初始化完成');
            }
            catch (error) {
                console.error('数据库初始化失败:', error);
                throw error;
            }
        });
    }
    createDatabaseIfNotExists() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.pool.query(`CREATE DATABASE IF NOT EXISTS ${config_1.config.db.database} 
                 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
                console.log(`数据库 ${config_1.config.db.database} 检查/创建完成`);
            }
            catch (error) {
                console.error('创建数据库失败:', error);
                throw error;
            }
        });
    }
    executeMigrations() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // 读取migrations文件
                const sqlFile = path_1.default.join(__dirname, 'migrations', 'init.sql');
                const sqlContent = fs_1.default.readFileSync(sqlFile, 'utf8');
                // 分割SQL语句
                const statements = sqlContent
                    .split(';')
                    .filter(statement => statement.trim().length > 0);
                // 依次执行每个SQL语句
                for (const statement of statements) {
                    yield this.pool.query(statement);
                }
                console.log('数据表初始化完成');
            }
            catch (error) {
                console.error('执行数据库迁移失败:', error);
                throw error;
            }
        });
    }
}
const db = Database.getInstance();
// 导出初始化函数
const initDatabase = () => __awaiter(void 0, void 0, void 0, function* () {
    // await db.dropDatabase();
    yield db.initDatabase();
});
exports.initDatabase = initDatabase;
exports.default = db;
