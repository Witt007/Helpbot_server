import axios from 'axios';
import { Readable } from 'stream';
import { config } from '../config';

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

export class DifyService {
    private apiKey: string;
    private baseUrl: string;

    constructor() {
        this.apiKey = config.dify.apiKey;
        this.baseUrl = config.dify.apiUrl;
    }

    async streamChat(params: {
        query: string;
        history: ChatMessage[];
        openId: string;
        conversationId: string;
    }): Promise<Readable> {
        try {
            // 构建上下文消息
            params.history=params.history.slice(0,3);
            const contextMessage = params.history
                .map(msg => `${msg.role === 'user' ? '用户' : 'AI助手'}: ${msg.content}`)
                .join('\n');
            
            // 将历史记录作为上下文添加到查询中
            const fullQuery = params.history.length > 0
                ? `${contextMessage}\n用户: ${params.query}`
                : params.query;

            const response = await axios.post(
                `${this.baseUrl}/chat-messages`,
                {
                    inputs:{},
                    query: fullQuery,
                    response_mode: 'streaming',
                    conversation_id: params.conversationId,
                    user: params.openId,
                    // 移除 history 参数
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    responseType: 'stream'
                }
            );

            return response.data;
        } catch (error) {
            throw new Error('调用 Dify API 失败');
        }
    }
} 