import {ChatSessionModel} from '../models/ChatSessionModel';
import {MessageModel} from '../models/MessageModel';
import {ChatSession} from '../entities/ChatSession';
import {Message} from '../entities/Message';
import db from '../database/db';
import {logger} from '../utils/logger';
import {Cache} from '../utils/cache';
import {AppError, DatabaseError} from '../types/errors';
import {DifyService} from './DifyService';
import {WebSocketService} from './WebSocketService';
import {Readable} from 'stream';
import {v4 as uuidv4} from 'uuid';

enum wsMessageType {
    answer = 'answer',
    new_topic = 'new_topic',
    error = 'error',
    suggestions = 'suggestions'
}

export class ChatService {
    private sessionModel = new ChatSessionModel();
    private messageModel = new MessageModel();
    private cache: Cache;
    private difyService: DifyService;
    private wsService: WebSocketService;

    constructor() {
        this.cache = new Cache('chat:');
        this.difyService = new DifyService();
        this.wsService = WebSocketService.getInstance();
    }

    async createSession(id: string, openId: string, title?: string): Promise<ChatSession> {
        try {
            const session = await this.sessionModel.create({openId, title, id});
            logger.info('新会话创建成功', {sessionId: session.id, openId});


            // 清除用户会话列表缓存
            await this.cache.del(`user_sessions:${openId}`);
            return session;
        } catch (error) {
            logger.error('创建会话失败', { error, openId });
            throw new DatabaseError('创建会话失败');
        }
    }

    async getUserSessions(openId: string): Promise<ChatSession[]> {
        try {
            // 尝试从缓存获取
            const cacheKey = `user_sessions:${openId}`;
            const cachedSessions = await this.cache.get<ChatSession[]>(cacheKey);

            if (cachedSessions) {
                return cachedSessions;
            }

            const sessions = await this.sessionModel.findByOpenId(openId);

            // 设置缓存，有效期30分钟
            await this.cache.set(cacheKey, sessions, 1800);

            return sessions;
        } catch (error) {
            logger.error('获取用户会话列表失败', { error, openId });
            throw new DatabaseError('获取会话列表失败');
        }
    }

    async sendMessage(data: {
        conversationId: string;
        content: string;
        role: Message['role'];
        openId: string;
    }): Promise<Message> {
        try {
            //await validate(validators.message, data);

            return await db.transaction(async () => {

                let fullContent = '', peerId = uuidv4(), id = uuidv4();
                console.log(
                    'peerId',
                    peerId,
                    'id',
                    id)
                let userMessage;
                try {

                    // 保存用户消息
                    userMessage = await this.messageModel.create({
                        id: peerId,
                        conversationId: data.conversationId,
                        content: data.content,
                        role: data.role,
                        status: 'sent'
                    });
                    // 创建 AI 回复消息记录
                    const aiMessage = await this.messageModel.create({
                        conversationId: data.conversationId,
                        content: '',
                        role: 'assistant',
                        status: 'sending',
                        id
                    });
                    // 获取会话历史消息
                    const history = await this.getSessionMessages(data.conversationId);

                    // 调用 Dify 流式接口
                    const stream = await this.difyService.streamChat({
                        query: data.content,
                        history: history.map(msg => ({
                            role: msg.role,
                            content: msg.content
                        })),
                        openId: data.openId,
                        conversationId: data.conversationId
                    });
                    this.handleDifyStream(stream,
                        (parsedData) => {
                            fullContent += parsedData.answer;
                            // WebSocket 发送失败时，将消息状态标记为需要轮询
                            if (!this.wsService.sendMessage(data.openId, {
                                type: wsMessageType.answer,
                                data: {
                                    rawData: {...parsedData, content: parsedData.answer, id, peerId, role: "assistant"},
                                    isComplete: false
                                }
                            })) {
                                logger.warn('WebSocket 消息发送失败，客户端可能已断开', {
                                    openId: data.openId,
                                    messageId: aiMessage.id
                                });
                            }
                        },
                        async () => {
                            // 更新 AI 消息内容和状态
                            await this.messageModel.updateContent(id, fullContent);
                            await this.messageModel.updateStatus(id, 'sent');

                            // 发送完成信号
                            if (this.wsService.isConnected(data.openId)) {
                                this.wsService.sendMessage(data.openId, {
                                    type: wsMessageType.answer,
                                    data: {
                                        rawData: {...aiMessage, content: fullContent, id, peerId},
                                        isComplete: true
                                    }
                                });
                            }

                            await this.cache.del(`conversation_messages:${data.conversationId}`);
                        },
                        async (error: Error) => {
                            logger.error('Dify 响应错误', {error, messageId: aiMessage.id});
                            await this.messageModel.updateStatus(id, 'failed');

                            if (this.wsService.isConnected(data.openId)) {
                                this.wsService.sendMessage(data.openId, {
                                    type: wsMessageType.error,
                                    data: {
                                        messageId: aiMessage.id,
                                        error: '消息处理失败'
                                    }
                                });
                            }
                        });

                } catch (e: unknown) {
                    throw e
                }

                return userMessage;
            });
        } catch (error) {
            logger.error('发送消息失败', { error, ...data });
            if (error instanceof AppError) {
                throw error;
            }
            throw new DatabaseError('发送消息失败');
        }
    }

    async updateMessage(messageId: string, content: string) {
        await this.messageModel.updateContent(messageId, content);
    }

    async deleteMessage(ids: string[]) {

        return await db.transaction(async () => {
            return await this.messageModel.deleteLatestMessagesByIds(ids);
        })
    }

    async handleDifyStream(stream: Readable, onMessage: (parsedData: {
        event: string,
        answer: string,
        conversation_id: string,
        message_id: string
    }) => void, onEnd: () => void, onError: (error: Error) => void) {

        /*  let messageBuffer: string[] = [];
         const flushInterval = 0; // 每100ms尝试发送一次
 
         // 创建消息发送器
         const sendBufferedMessage = () => {
             if (messageBuffer.length > 0 && this.wsService.isConnected(data.openId)) {
                 const content = messageBuffer.join('');
                 this.wsService.sendMessage(data.openId, {
                     type: 'message',
                     data: {
                         messageId: aiMessage.id,
                         content,
                         isComplete: false
                     }
                 });
                 messageBuffer = [];
             }
         };
         // 设置定时发送
         const sendInterval = setInterval(sendBufferedMessage, flushInterval); */

        let buffer = '';
        stream.on('data', async (chunk: string) => {


            {
                buffer += chunk.toString();

                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.trim() === '') continue;
                    if (line.startsWith('data: ')) {
                        const jsonstr = line.slice(6);
                        if (jsonstr === '[DONE]') {
                            stream.emit('end');
                            logger.info('Dify 流式接口完成', jsonstr);
                            return;
                        }

                        try {
                            const parsedData = JSON.parse(jsonstr);
                            if (parsedData.event != 'message') {
                                continue;
                            }
                            onMessage(parsedData);

                        } catch (e) {
                            console.error('解析 SSE 数据失败:', e);
                        }
                    }
                }
            }


        });

        stream.on('end', async () => {
            // clearInterval(sendInterval); // 清理定时器
            // sendBufferedMessage(); // 发送剩余的消息

            onEnd();
        });

        stream.on('error', async (error: Error) => {
            //clearInterval(sendInterval); // 清理定时器
            onError(error);
        });
    }
    async getSessionMessages(conversationId: string): Promise<Message[]> {
        try {
            // 尝试从缓存获取
            const cacheKey = `conversation_messages:${conversationId}`;
            const cachedMessages = await this.cache.get<Message[]>(cacheKey);

            if (cachedMessages) {
                return cachedMessages;
            }

            const messages = await this.messageModel.findByConversationId(conversationId);

            // 设置缓存，有效期5分钟
            await this.cache.set(cacheKey, messages, 300);

            return messages;
        } catch (error) {
            logger.error('获取会话消息失败', { error, conversationId });
            throw new DatabaseError('获取会话消息失败');
        }
    }

    async getUserMessages(openId: string, offset: number = 0, limit: number = 10): Promise<Message[]> {
        try {
            /*    不能使用缓存 存在问题 会导致更新的内容无法返回
            const cacheKey = `user_messages:${openId}:${offset}:${limit}`;
             */
            /*   const cachedMessages = await this.cache.get<Message[]>(cacheKey);

         *  if (cachedMessages) {
                  return cachedMessages;
              }*/

            const messages = await this.messageModel.findUserMessages(openId, offset, limit);

            // 设置缓存，有效期5分钟
            //await this.cache.set(cacheKey, messages, 300);

            return messages;
        } catch (error) {
            logger.error('获取用户消息列表失败', { error, openId, offset });
            throw new DatabaseError('获取用户消息列表失败');
        }
    }

    async generateNewTopic(openId: string, topic?: string) {
        try {
            // 调用 Dify API 生成话题
            const difyResponse = await this.difyService.streamChat({
                conversationId: '',
                query: topic || "作为硼矩新材料科技有限公司的客服代表，请生成一个专业的开场白和问题，要求：1. 介绍自己是硼矩新材料的客服 2. 询问客户对氮化硼产品的了解程度或使用需求 3. 表达愿意为客户介绍我们的产品和成功案例",
                history: [],
                openId: openId
            });
            let fullContent = '', conversationId = '', id = uuidv4();
            return await db.transaction(async () => {

                await this.handleDifyStream(difyResponse,
                    (parsedData) => {
                        fullContent += parsedData.answer;
                        conversationId || (conversationId = parsedData.conversation_id);
                        id || (id = parsedData.message_id);
                        this.wsService.sendMessage(openId, {
                            type: wsMessageType.new_topic,
                            data: {
                                rawData: {...parsedData, conversationId, content: parsedData.answer, id},
                                isComplete: false
                            }
                        });
                    },
                    async () => {
                        console.log('完成');
                        // 创建新的会话
                        const conversation = await this.createSession(
                            conversationId,
                            openId,
                            '新话题对话'
                        )

                        // 创建 AI 消息记录
                        const ms: Omit<Message, 'createdAt'> = {
                            id,
                            conversationId: conversation.id,
                            content: fullContent,
                            role: 'assistant',
                            status: 'sent'
                        }
                        await this.messageModel.create(ms);

                        conversationId = '';// need to be deleted
                        fullContent='';
                        id = '';
                        this.wsService.sendMessage(openId, {
                            type: wsMessageType.new_topic,
                            data: {
                                rawData: ms,
                                isComplete: true
                            }
                        });

                    },
                    async (error: Error) => {
                        console.error('Dify 响应错误', { error });
                        this.messageModel.updateStatus(id, 'failed');
                    });

                return conversationId;



            });




        } catch (error) {
            console.error('生成话题失败:', error);
            throw new Error('生成话题失败');
        }
    }

    async getNextSuggestions(openId: string, query: string) {
        /*const messages = await this.getUserMessages(openId);
        const lastMessage = messages[messages.length - 1];*/
      
        const difyResponse = await this.difyService.streamChat({
            conversationId: '',
            query,
            history: [],
            openId: openId
        });

        let nextSuggestions = '';
        this.handleDifyStream(difyResponse,
            (parsedData) => {

                nextSuggestions += parsedData.answer;
                this.wsService.sendMessage(openId, {
                    type: wsMessageType.suggestions,
                    data: {
                        rawData: {...parsedData, content: parsedData.answer, id: parsedData.message_id},
                        isComplete: false
                    }
                });
            },
            async () => {
                this.wsService.sendMessage(openId, {
                    type: wsMessageType.suggestions,
                    data: {
                        rawData: {content: nextSuggestions},
                        isComplete: true
                    }
                });
                return nextSuggestions;
            },
            async (error: Error) => {
                console.error('Dify 响应错误', { error });
            });

        return nextSuggestions;
    }
} 