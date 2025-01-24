import { query } from '../database/mysql';

interface User  {
    id: string;
    username: string;
    email: string;
    // 其他字段...
}

export const createUser = async (username: string, email: string) => {
    const userId = generateUniqueId(); //  需要实现 generateUniqueId 函数
    await query('INSERT INTO users (id, username, email, created_at) VALUES (?, ?, ?, NOW())', [userId, username, email]);
    return userId;
};

export const getUserById = async (userId: string): Promise<User | undefined> => {
    const users = await query('SELECT * FROM users WHERE id = ?', [userId]) as User[];
    return users[0];
};

export const updateUser = async (userId: string, username: string, email: string) => {
    await query('UPDATE users SET username = ?, email = ? WHERE id = ?', [username, email, userId]);
};

export const deleteUser = async (userId: string) => {
    await query('DELETE FROM users WHERE id = ?', [userId]);
};

export const getAllUsers = async () => {
    return await query('SELECT * FROM users');
};

//  简易的 UUID 生成函数，实际应用中可以使用更完善的 UUID 库 (如果 message.ts 中没有定义，这里也需要)
const generateUniqueId = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// ... 用户登录，session 管理等服务逻辑 