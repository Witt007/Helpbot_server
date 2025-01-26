import db from '../database/db';
import { ChatSession } from '../entities/ChatSession';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
    
export class ChatSessionModel {
    async create(session: Omit<ChatSession, 'createdAt' | 'updatedAt'>): Promise<ChatSession> {
        const [result] = await db.query(
            'INSERT INTO chat_sessions (open_id, title, id) VALUES (?, ?, ?)',
            [session.openId, session.title, session.id]
        ) as [ResultSetHeader, any];
        return { ...session } as ChatSession;
    }

    async findById(id: number): Promise<ChatSession | null> {
        const [rows] = await db.query<RowDataPacket[]>(
            'SELECT * FROM chat_sessions WHERE id = ?', 
            [id]
        );
        return (rows[0] as unknown as ChatSession) || null;
    }

    async findByOpenId(openId: string): Promise<ChatSession[]> {
        const [rows] = await db.query<RowDataPacket[]>(
            'SELECT * FROM chat_sessions WHERE open_id = ?', 
            [openId]
        );
        return rows as unknown as ChatSession[];
    }
} 