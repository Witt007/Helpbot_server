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
exports.updateMessageStatus = exports.sendMessageToAI = void 0;
const dify_1 = require("./dify");
const db_1 = __importDefault(require("../database/db"));
const sendMessageToAI = (userId, conversationId, messageContent) => __awaiter(void 0, void 0, void 0, function* () {
    // 1. 保存用户消息到数据库
    const messageId = yield saveMessageToDatabase(conversationId, messageContent, 'user', 'sending');
    // 2. 调用 Dify API 获取流式响应
    const stream = yield (0, dify_1.streamDifyChat)({ user_id: userId }, messageContent, conversationId, userId);
    yield saveMessageToDatabase(conversationId, messageContent, 'assistant', 'sending');
    // 3. 更新消息状态为 'sent'
    yield (0, exports.updateMessageStatus)(messageId, 'sent');
    return { messageId, stream };
});
exports.sendMessageToAI = sendMessageToAI;
const updateMessageStatus = (messageId, status) => __awaiter(void 0, void 0, void 0, function* () {
    yield db_1.default.query('UPDATE messages SET status = ? WHERE id = ?', [status, messageId]);
});
exports.updateMessageStatus = updateMessageStatus;
const saveMessageToDatabase = (conversationId, content, role, status) => __awaiter(void 0, void 0, void 0, function* () {
    const [result] = yield db_1.default.query('INSERT INTO messages (conversation_id, role, status, content) VALUES ( ?, ?, ?, ?)', [conversationId, role, status, content]);
    return result.insertId;
});
// ... 其他消息相关的服务逻辑，例如获取消息历史，语音转文字等 
