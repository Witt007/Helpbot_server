import db from '../database/db';
import {Message} from '../entities/Message';
import {ResultSetHeader, RowDataPacket} from 'mysql2';

export class MessageModel {
    async create(message: Omit<Message, 'id' | 'createdAt'>): Promise<Message> {
        const [result] = await db.query(
            'INSERT INTO messages (conversation_id, role, status, content) VALUES (?, ?, ?, ?)',
            [message.conversationId, message.role, message.status, message.content]
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

    async updateStatus(id: number, status: Message['status']): Promise<void> {
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
            ORDER BY m.id DESC
            LIMIT ? OFFSET ?
        `;
        
        const [messages] = await db.query(query, [openId, limit, offset]);
        return messages as Message[];
    }

    async updateContent(id: number, content: string): Promise<void> {
        const [result] = await db.query(
            'UPDATE messages SET content = ? WHERE id = ?',
            [content, id]
        ) as unknown as [ResultSetHeader, any];
        
        if (result.affectedRows === 0) {
            throw new Error(`未能更新ID为 ${id} 的消息`);
        }
    }


    async deleteLatestMessageByOpenId(openId: string): Promise<number> {
        const query = `
            DELETE
            FROM messages
            WHERE id = (SELECT sub.id
                        FROM (SELECT m.id
                              FROM messages m
                                       JOIN chat_sessions cs ON m.conversation_id = cs.id
                              WHERE cs.open_id = ?
                              ORDER BY m.id DESC LIMIT 1) sub)
        `;

        const [result] = await db.query(query, [openId]) as unknown as [ResultSetHeader, any];


        if (result.affectedRows === 0) {
            console.error(`未能删除 openId 为 ${openId} 的最新消息`);
        }
        return result.affectedRows;
    }
} 