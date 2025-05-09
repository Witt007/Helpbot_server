export interface Message {
    id: string;
    conversationId: string;
    role: 'user' | 'assistant';
    status: 'sending' | 'sent' | 'failed';
    content: string;
    createdAt: Date;
    updatedAt?: Date;
    sort_index?: number;
} 