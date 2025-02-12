import db from '../database/db';
import {Message} from '../entities/Message';
import {ResultSetHeader, RowDataPacket} from 'mysql2';

export class MessageModel {
    async create(message: Omit<Message, 'createdAt'>): Promise<Message> {
        const [result] = await db.query(
            'INSERT INTO messages (id, conversation_id, role, status, content) VALUES (?, ?, ?, ?, ?)',
            [message.id, message.conversationId, message.role, message.status, message.content]
        ) as unknown as [ResultSetHeader, any];
        const created = await this.findById(result.insertId);
        if (!created) throw new Error('Failed to create message');
        return created;
    }

    async findById(id: number): Promise<Message | null> {
        const [rows] = await db.query<RowDataPacket[]>('SELECT * FROM messages WHERE id = ?', [id]);
        return rows[0] as Message || null;
    }

    async findByConversationId(conversationId: string): Promise<Message[]> {
        const [rows] = await db.query<RowDataPacket[]>(
            'SELECT * FROM messages WHERE conversation_id = ?', 
            [conversationId]
        );
        return rows as Message[];
    }

    async updateStatus(id: string, status: Message['status']): Promise<void> {
        const [result] = await db.query(
            'UPDATE messages SET status = ? WHERE id = ?', 
            [status, id]
        ) as unknown as [ResultSetHeader, any];
    }

    async findUserMessages(openId: string, offset: number, limit: number): Promise<Message[]> {
        const query = `
            SELECT m.* 
            FROM messages m
            JOIN chat_sessions cs ON m.conversation_id = cs.id
            WHERE cs.open_id = ?
            ORDER BY m.created_at DESC
            LIMIT ? OFFSET ?
        `;
        
        const [messages] = await db.query(query, [openId, limit, offset]);
        return messages as Message[];
    }

    async updateContent(id: string, content: string): Promise<void> {
        const [result] = await db.query(
            'UPDATE messages SET content = ? WHERE id = ?',
            [content, id]
        ) as unknown as [ResultSetHeader, any];
        
        if (result.affectedRows === 0) {
            throw new Error(`未能更新ID为 ${id} 的消息`);
        }
    }

// 假设函数签名修改为根据多个 messageId 批量删除
    public async deleteLatestMessagesByIds(ids: string[]): Promise<number> {
        if (!ids || ids.length === 0) {
            // 如果不传或传入空数组，则无需删除
            return 0;
        }

        // 构造适合 MySQL 的占位符
        const placeholders = ids.map(() => '?').join(',');

        const query = `
            DELETE
            FROM messages
            WHERE id IN (${placeholders})
        `;

        // 执行批量删除
        const [result] = await db.query(query, ids) as unknown as [ResultSetHeader, any];

        // 可根据受影响的行数进行后续处理，比如日志记录
        console.log('Deleted messages count:', result.affectedRows);

        return result.affectedRows;
    }

} 