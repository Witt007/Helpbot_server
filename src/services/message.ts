import { streamDifyChat } from './dify';
import db from '../database/db';
import mysql from 'mysql2/promise';
import { ResultSetHeader } from 'mysql2/promise';

export const sendMessageToAI = async (userId: string, conversationId: string, messageContent: string) => {
    // 1. 保存用户消息到数据库
    const messageId = await saveMessageToDatabase( conversationId, messageContent, 'user', 'sending');

    // 2. 调用 Dify API 获取流式响应
    const stream = await streamDifyChat({ user_id: userId }, messageContent, conversationId, userId);
    
    await saveMessageToDatabase(conversationId, messageContent, 'assistant', 'sending');
    // 3. 更新消息状态为 'sent'
    await updateMessageStatus(messageId, 'sent');
    
    return { messageId, stream };
};

export const updateMessageStatus = async (messageId: number, status: 'sending' | 'sent' | 'failed') => {
    await db.query('UPDATE messages SET status = ? WHERE id = ?', [status, messageId]);
};

const saveMessageToDatabase = async (
    conversationId: string | undefined, 
    content: string, 
    role: 'user' | 'assistant',
    status: 'sending' | 'sent' | 'failed'
) => {
    const [result] = await db.query<ResultSetHeader>(
        'INSERT INTO messages (conversation_id, role, status, content) VALUES ( ?, ?, ?, ?)',
        [conversationId, role, status, content]
    ) 
    return result.insertId;
};

// ... 其他消息相关的服务逻辑，例如获取消息历史，语音转文字等 