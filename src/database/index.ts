import { initMysql } from './mysql';

export const initDatabase = async () => {
    await initMysql(); // 初始化 MySQL 连接
    console.log('Database initialized');
}; 