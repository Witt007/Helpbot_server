import { streamDifyChat } from './dify';
import { query } from '../database/mysql';

export const sendMessageToAI = async (userId: string, conversationId: string | undefined, messageContent: string) => {
    // 1. 保存用户消息到数据库 (可选)
    const messageId = await saveMessageToDatabase(userId, conversationId, messageContent, 'user');

    // 2. 调用 Dify API 获取流式响应
    const stream = await streamDifyChat({ user_id: userId }, messageContent, conversationId, userId);
    return { messageId, stream };
};

export const updateMessageStatus = async (messageId: string, status: string) => {
    // 更新消息状态，例如 'sending', 'sent', 'failed' 等
    await query('UPDATE messages SET status = ? WHERE id = ?', [status, messageId]);
};


const saveMessageToDatabase = async (userId: string, conversationId: string | undefined, content: string, senderType: 'user' | 'ai') => {
    const messageId = generateUniqueId(); //  需要实现 generateUniqueId 函数
    await query(
        'INSERT INTO messages (id, conversation_id, sender_id, sender_type, content, timestamp) VALUES (?, ?, ?, ?, ?, NOW())',
        [messageId, conversationId, userId, senderType, content]
    );
    return messageId;
};

//  简易的 UUID 生成函数，实际应用中可以使用更完善的 UUID 库
const generateUniqueId = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};


// ... 其他消息相关的服务逻辑，例如获取消息历史，语音转文字等 