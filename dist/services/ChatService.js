"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const ChatSessionModel_1 = require("../models/ChatSessionModel");
const MessageModel_1 = require("../models/MessageModel");
const db_1 = __importDefault(require("../database/db"));
const logger_1 = require("../utils/logger");
const cache_1 = require("../utils/cache");
const errors_1 = require("../types/errors");
const DifyService_1 = require("./DifyService");
const WebSocketService_1 = require("./WebSocketService");
const uuid_1 = require("uuid");
var wsMessageType;
(function (wsMessageType) {
    wsMessageType["answer"] = "answer";
    wsMessageType["new_topic"] = "new_topic";
    wsMessageType["error"] = "error";
    wsMessageType["suggestions"] = "suggestions";
})(wsMessageType || (wsMessageType = {}));
class ChatService {
    constructor() {
        this.sessionModel = new ChatSessionModel_1.ChatSessionModel();
        this.messageModel = new MessageModel_1.MessageModel();
        this.cache = new cache_1.Cache('chat:');
        this.difyService = new DifyService_1.DifyService();
        this.wsService = WebSocketService_1.WebSocketService.getInstance();
    }
    createSession(id, openId, title) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const session = yield this.sessionModel.create({ openId, title, id });
                logger_1.logger.info('新会话创建成功', { sessionId: session.id, openId });
                // 清除用户会话列表缓存
                yield this.cache.del(`user_sessions:${openId}`);
                return session;
            }
            catch (error) {
                logger_1.logger.error('创建会话失败', { error, openId });
                throw new errors_1.DatabaseError('创建会话失败');
            }
        });
    }
    getUserSessions(openId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // 尝试从缓存获取
                const cacheKey = `user_sessions:${openId}`;
                const cachedSessions = yield this.cache.get(cacheKey);
                if (cachedSessions) {
                    return cachedSessions;
                }
                const sessions = yield this.sessionModel.findByOpenId(openId);
                // 设置缓存，有效期30分钟
                yield this.cache.set(cacheKey, sessions, 1800);
                return sessions;
            }
            catch (error) {
                logger_1.logger.error('获取用户会话列表失败', { error, openId });
                throw new errors_1.DatabaseError('获取会话列表失败');
            }
        });
    }
    sendMessage(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //await validate(validators.message, data);
                return yield db_1.default.transaction(() => __awaiter(this, void 0, void 0, function* () {
                    let fullContent = '', peerId = (0, uuid_1.v4)(), id = (0, uuid_1.v4)();
                    console.log('peerId', peerId, 'id', id);
                    let userMessage;
                    try {
                        // 保存用户消息
                        userMessage = yield this.messageModel.create({
                            id: peerId,
                            conversationId: data.conversationId,
                            content: data.content,
                            role: data.role,
                            status: 'sent'
                        });
                        // 创建 AI 回复消息记录
                        const aiMessage = yield this.messageModel.create({
                            conversationId: data.conversationId,
                            content: '',
                            role: 'assistant',
                            status: 'sending',
                            id
                        });
                        // 获取会话历史消息
                        const history = yield this.getSessionMessages(data.conversationId);
                        // 调用 Dify 流式接口
                        const stream = yield this.difyService.streamChat({
                            query: data.content,
                            history: history.map(msg => ({
                                role: msg.role,
                                content: msg.content
                            })),
                            openId: data.openId,
                            conversationId: data.conversationId
                        });
                        this.handleDifyStream(stream, (parsedData) => {
                            fullContent += parsedData.answer;
                            // WebSocket 发送失败时，将消息状态标记为需要轮询
                            if (!this.wsService.sendMessage(data.openId, {
                                type: wsMessageType.answer,
                                data: {
                                    rawData: Object.assign(Object.assign({}, parsedData), { content: parsedData.answer, id, peerId, role: "assistant" }),
                                    isComplete: false
                                }
                            })) {
                                logger_1.logger.warn('WebSocket 消息发送失败，客户端可能已断开', {
                                    openId: data.openId,
                                    messageId: aiMessage.id
                                });
                            }
                        }, () => __awaiter(this, void 0, void 0, function* () {
                            // 更新 AI 消息内容和状态
                            yield this.messageModel.updateContent(id, fullContent);
                            yield this.messageModel.updateStatus(id, 'sent');
                            // 发送完成信号
                            if (this.wsService.isConnected(data.openId)) {
                                this.wsService.sendMessage(data.openId, {
                                    type: wsMessageType.answer,
                                    data: {
                                        rawData: Object.assign(Object.assign({}, aiMessage), { content: fullContent, id, peerId }),
                                        isComplete: true
                                    }
                                });
                            }
                            yield this.cache.del(`conversation_messages:${data.conversationId}`);
                        }), (error) => __awaiter(this, void 0, void 0, function* () {
                            logger_1.logger.error('Dify 响应错误', { error, messageId: aiMessage.id });
                            yield this.messageModel.updateStatus(id, 'failed');
                            if (this.wsService.isConnected(data.openId)) {
                                this.wsService.sendMessage(data.openId, {
                                    type: wsMessageType.error,
                                    data: {
                                        messageId: aiMessage.id,
                                        error: '消息处理失败'
                                    }
                                });
                            }
                        }));
                    }
                    catch (e) {
                        throw e;
                    }
                    return userMessage;
                }));
            }
            catch (error) {
                logger_1.logger.error('发送消息失败', Object.assign({ error }, data));
                if (error instanceof errors_1.AppError) {
                    throw error;
                }
                throw new errors_1.DatabaseError('发送消息失败');
            }
        });
    }
    updateMessage(messageId, content) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.messageModel.updateContent(messageId, content);
        });
    }
    deleteMessage(ids) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db_1.default.transaction(() => __awaiter(this, void 0, void 0, function* () {
                return yield this.messageModel.deleteLatestMessagesByIds(ids);
            }));
        });
    }
    handleDifyStream(stream, onMessage, onEnd, onError) {
        return __awaiter(this, void 0, void 0, function* () {
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
            stream.on('data', (chunk) => __awaiter(this, void 0, void 0, function* () {
                {
                    buffer += chunk.toString();
                    const lines = buffer.split('\n');
                    buffer = lines.pop() || '';
                    for (const line of lines) {
                        if (line.trim() === '')
                            continue;
                        if (line.startsWith('data: ')) {
                            const jsonstr = line.slice(6);
                            if (jsonstr === '[DONE]') {
                                stream.emit('end');
                                logger_1.logger.info('Dify 流式接口完成', jsonstr);
                                return;
                            }
                            try {
                                const parsedData = JSON.parse(jsonstr);
                                if (parsedData.event != 'message') {
                                    continue;
                                }
                                onMessage(parsedData);
                            }
                            catch (e) {
                                console.error('解析 SSE 数据失败:', e);
                            }
                        }
                    }
                }
            }));
            stream.on('end', () => __awaiter(this, void 0, void 0, function* () {
                // clearInterval(sendInterval); // 清理定时器
                // sendBufferedMessage(); // 发送剩余的消息
                onEnd();
            }));
            stream.on('error', (error) => __awaiter(this, void 0, void 0, function* () {
                //clearInterval(sendInterval); // 清理定时器
                onError(error);
            }));
        });
    }
    getSessionMessages(conversationId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // 尝试从缓存获取
                const cacheKey = `conversation_messages:${conversationId}`;
                const cachedMessages = yield this.cache.get(cacheKey);
                if (cachedMessages) {
                    return cachedMessages;
                }
                const messages = yield this.messageModel.findByConversationId(conversationId);
                // 设置缓存，有效期5分钟
                yield this.cache.set(cacheKey, messages, 300);
                return messages;
            }
            catch (error) {
                logger_1.logger.error('获取会话消息失败', { error, conversationId });
                throw new errors_1.DatabaseError('获取会话消息失败');
            }
        });
    }
    getUserMessages(openId, offset = 0, limit = 10) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                /*    不能使用缓存 存在问题 会导致更新的内容无法返回
                const cacheKey = `user_messages:${openId}:${offset}:${limit}`;
                 */
                /*   const cachedMessages = await this.cache.get<Message[]>(cacheKey);
    
             *  if (cachedMessages) {
                      return cachedMessages;
                  }*/
                const messages = yield this.messageModel.findUserMessages(openId, offset, limit);
                // 设置缓存，有效期5分钟
                //await this.cache.set(cacheKey, messages, 300);
                return messages;
            }
            catch (error) {
                logger_1.logger.error('获取用户消息列表失败', { error, openId, offset });
                throw new errors_1.DatabaseError('获取用户消息列表失败');
            }
        });
    }
    generateNewTopic(openId, topic) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // 调用 Dify API 生成话题
                const difyResponse = yield this.difyService.streamChat({
                    conversationId: '',
                    query: topic || "作为硼矩新材料科技有限公司的客服代表，请生成一个专业的开场白和问题，要求：1. 介绍自己是硼矩新材料的客服 2. 询问客户对氮化硼产品的了解程度或使用需求 3. 表达愿意为客户介绍我们的产品和成功案例",
                    history: [],
                    openId: openId
                });
                let fullContent = '', conversationId = '', id = (0, uuid_1.v4)();
                return yield db_1.default.transaction(() => __awaiter(this, void 0, void 0, function* () {
                    yield this.handleDifyStream(difyResponse, (parsedData) => {
                        fullContent += parsedData.answer;
                        conversationId || (conversationId = parsedData.conversation_id);
                        id || (id = parsedData.message_id);
                        this.wsService.sendMessage(openId, {
                            type: wsMessageType.new_topic,
                            data: {
                                rawData: Object.assign(Object.assign({}, parsedData), { conversationId, content: parsedData.answer, id }),
                                isComplete: false
                            }
                        });
                    }, () => __awaiter(this, void 0, void 0, function* () {
                        console.log('完成');
                        // 创建新的会话
                        const conversation = yield this.createSession(conversationId, openId, '新话题对话');
                        // 创建 AI 消息记录
                        const ms = {
                            id,
                            conversationId: conversation.id,
                            content: fullContent,
                            role: 'assistant',
                            status: 'sent'
                        };
                        yield this.messageModel.create(ms);
                        conversationId = ''; // need to be deleted
                        fullContent = '';
                        id = '';
                        this.wsService.sendMessage(openId, {
                            type: wsMessageType.new_topic,
                            data: {
                                rawData: ms,
                                isComplete: true
                            }
                        });
                    }), (error) => __awaiter(this, void 0, void 0, function* () {
                        console.error('Dify 响应错误', { error });
                        this.messageModel.updateStatus(id, 'failed');
                    }));
                    return conversationId;
                }));
            }
            catch (error) {
                console.error('生成话题失败:', error);
                throw new Error('生成话题失败');
            }
        });
    }
    getNextSuggestions(openId, query) {
        return __awaiter(this, void 0, void 0, function* () {
            /*const messages = await this.getUserMessages(openId);
            const lastMessage = messages[messages.length - 1];*/
            const difyResponse = yield this.difyService.streamChat({
                conversationId: '',
                query,
                history: [],
                openId: openId
            });
            let nextSuggestions = '';
            this.handleDifyStream(difyResponse, (parsedData) => {
                nextSuggestions += parsedData.answer;
                this.wsService.sendMessage(openId, {
                    type: wsMessageType.suggestions,
                    data: {
                        rawData: Object.assign(Object.assign({}, parsedData), { content: parsedData.answer, id: parsedData.message_id }),
                        isComplete: false
                    }
                });
            }, () => __awaiter(this, void 0, void 0, function* () {
                this.wsService.sendMessage(openId, {
                    type: wsMessageType.suggestions,
                    data: {
                        rawData: { content: nextSuggestions },
                        isComplete: true
                    }
                });
                return nextSuggestions;
            }), (error) => __awaiter(this, void 0, void 0, function* () {
                console.error('Dify 响应错误', { error });
            }));
            return nextSuggestions;
        });
    }
}
exports.ChatService = ChatService;
