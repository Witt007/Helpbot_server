import fetch from 'node-fetch';
import { config } from '../config';

const DIFY_API_URL = config.dify.apiUrl;
const DIFY_API_KEY = config.dify.apiKey;

export const streamDifyChat = async (inputs: Record<string, string>, query: string, conversationId?: string, userId?: string) => {
    const headers = {
        'Authorization': `Bearer ${DIFY_API_KEY}`,
        'Content-Type': 'application/json',
    };

    const body = JSON.stringify({
        inputs: inputs,
        query: query,
        conversation_id: conversationId,
        user: userId,
    });

    try {
        const response = await fetch(`${DIFY_API_URL}/chat-messages`, {
            method: 'POST',
            headers: headers,
            body: body,
        });

        if (!response.ok) {
            console.error('Dify API error:', response.status, response.statusText);
            throw new Error(`Dify API request failed: ${response.status} ${response.statusText}`);
        }
        return response.body; // 返回 ReadableStream 用于流式处理
    } catch (error) {
        console.error('Error calling Dify API:', error);
        throw error;
    }
};

// ... 可以添加其他 Dify API 相关的封装，例如语音转文字 (如果 Dify 提供) 