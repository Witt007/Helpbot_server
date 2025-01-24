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
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMessageStatus = exports.sendMessageToAI = void 0;
const dify_1 = require("./dify");
const mysql_1 = require("../database/mysql");
const sendMessageToAI = (userId, conversationId, messageContent) => __awaiter(void 0, void 0, void 0, function* () {
    // 1. 保存用户消息到数据库 (可选)
    const messageId = yield saveMessageToDatabase(userId, conversationId, messageContent, 'user');
    // 2. 调用 Dify API 获取流式响应
    const stream = yield (0, dify_1.streamDifyChat)({ user_id: userId }, messageContent, conversationId, userId);
    return { messageId, stream };
});
exports.sendMessageToAI = sendMessageToAI;
const updateMessageStatus = (messageId, status) => __awaiter(void 0, void 0, void 0, function* () {
    // 更新消息状态，例如 'sending', 'sent', 'failed' 等
    yield (0, mysql_1.query)('UPDATE messages SET status = ? WHERE id = ?', [status, messageId]);
});
exports.updateMessageStatus = updateMessageStatus;
const saveMessageToDatabase = (userId, conversationId, content, senderType) => __awaiter(void 0, void 0, void 0, function* () {
    const messageId = generateUniqueId(); //  需要实现 generateUniqueId 函数
    yield (0, mysql_1.query)('INSERT INTO messages (id, conversation_id, sender_id, sender_type, content, timestamp) VALUES (?, ?, ?, ?, ?, NOW())', [messageId, conversationId, userId, senderType, content]);
    return messageId;
});
//  简易的 UUID 生成函数，实际应用中可以使用更完善的 UUID 库
const generateUniqueId = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};
// ... 其他消息相关的服务逻辑，例如获取消息历史，语音转文字等 
