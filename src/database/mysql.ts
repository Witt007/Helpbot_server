import mysql from 'mysql2/promise';
import { config } from '../config';

let pool: mysql.Pool;

export const initMysql = async () => {
    pool = mysql.createPool(config.mysql);
    try {
        await pool.getConnection();
        console.log('MySQL database connected');
    } catch (error) {
        console.error('Failed to connect to MySQL database:', error);
    }
};

export const getMysqlPool = () => {
    if (!pool) {
        throw new Error('MySQL pool not initialized');
    }
    return pool;
};

// 封装常用的数据库操作，例如 query
export const query = async (sql: string, values?: any[]) => {
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.query(sql, values);
        return rows;
    } finally {
        connection.release(); // 释放连接回连接池
    }
}; 