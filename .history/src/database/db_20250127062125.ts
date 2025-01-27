import mysql, { Pool, PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { config } from '../config';
import fs from 'fs';
import path from 'path';

class Database {
    private static instance: Database;
    private pool: Pool;

    private constructor() {
        this.pool = mysql.createPool({
            host: config.db.host,
            port: config.db.port,
            user: config.db.user,
            password: config.db.password,
            timezone: config.db.timezone,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });
    }

    public static getInstance(): Database {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }

    public getPool(): Pool {
        return this.pool;
    }

    public async dropDatabase(): Promise<void> {
       await this.pool.query(`DROP DATABASE ${config.db.database}`);
    }

    public async query<T>(sql: string, values?: any[]): Promise<[T, any]> {
        try {
            const result = await this.pool.execute(sql, values);
            return result as [T, any];
            
        } catch (error) {
            console.error('SQL Error:', error);
        }
        return [[] as T, null];
    }

    async transaction<T>(callback: (connection: PoolConnection) => Promise<T>): Promise<T> {
        const connection = await this.pool.getConnection();
        await connection.beginTransaction();
        
        try {
            const result = await callback(connection);
            await connection.commit();
            return result;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    useDB(): void { 
        this.pool.query(`USE ${config.db.database}`);
    }

    // 初始化数据库
    public async initDatabase(): Promise<void> {
        try {
            // 创建数据库（如果不存在）
            await this.createDatabaseIfNotExists();

            // 连接到指定的数据库
            await this.u

            // 读取并执行初始化SQL文件
            await this.executeMigrations();

            console.log('数据库初始化完成');
        } catch (error) {
            console.error('数据库初始化失败:', error);
            throw error;
        }
    }

    private async createDatabaseIfNotExists(): Promise<void> {
        try {
            await this.pool.query(
                `CREATE DATABASE IF NOT EXISTS ${config.db.database} 
                 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
            );
            console.log(`数据库 ${config.db.database} 检查/创建完成`);
        } catch (error) {
            console.error('创建数据库失败:', error);
            throw error;
        }
    }

    private async executeMigrations(): Promise<void> {
        try {
            // 读取migrations文件
            const sqlFile = path.join(__dirname, 'migrations', 'init.sql');
            const sqlContent = fs.readFileSync(sqlFile, 'utf8');

            // 分割SQL语句
            const statements = sqlContent
                .split(';')
                .filter(statement => statement.trim().length > 0);

            // 依次执行每个SQL语句
            for (const statement of statements) {
                await this.pool.query(statement);
            }
            console.log('数据表初始化完成');
        } catch (error) {
            console.error('执行数据库迁移失败:', error);
            throw error;
        }
    }
}

const db = Database.getInstance();

// 导出初始化函数
export const initDatabase = async () => {
   // await db.dropDatabase();
    await db.initDatabase();
};

export default db; 