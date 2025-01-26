import  db  from '../database/db';
import { WxUser } from '../entities/WxUser';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export class WxUserModel {
    async create(user: Omit<WxUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<WxUser> {
        const [result] = await db.query(
            'INSERT INTO wx_users (open_id, union_id, session_key, nick_name, avatar_url) VALUES (?, ?, ?, ?, ?)',
            [user.openId, user.unionId, user.sessionKey, user.nickName, user.avatarUrl]
        ) as unknown as [ResultSetHeader, any];
        const created = await this.findByOpenId(user.openId);
        if (!created) throw new Error('Failed to create user');
        return created;
    }

    async findByOpenId(openId: string): Promise<WxUser | null> {
        const [rows] = await db.query<RowDataPacket[]>(
            'SELECT * FROM wx_users WHERE open_id = ?', 
            [openId]
        );
        return rows[0] as WxUser || null;
    }

    async updateLastLogin(openId: string): Promise<void> {
        const [result] = await db.query(
            'UPDATE wx_users SET last_login_time = CURRENT_TIMESTAMP WHERE open_id = ?',
            [openId]
        ) as unknown as [ResultSetHeader, any];
    }
} 