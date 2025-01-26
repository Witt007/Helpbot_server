export interface Message {
    id: number;
    conversationId: string;
    role: 'user' | 'assistant';
    status: 'sending' | 'sent' | 'failed';
    content: string;
    createdAt: Date;
} 