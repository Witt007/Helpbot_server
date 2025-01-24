"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.setupMessageController = void 0;
const messageService = __importStar(require("../services/message"));
const setupMessageController = (app) => {
    // 发送消息 (初始消息，通过 HTTP 触发，然后切换到 WebSocket 流式接收)
    app.post('/messages', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { userId, conversationId, messageContent } = req.body;
            const { messageId, stream } = yield messageService.sendMessageToAI(userId, conversationId, messageContent);
            //  这里只是启动 Dify 流，实际流式数据推送需要通过 WebSocket
            //  可以返回 messageId 给客户端，客户端通过 WebSocket 监听消息更新
            res.status(202).json({ messageId, message: 'Message processing started, will be streamed via WebSocket' });
            //  TODO:  将 stream 通过 WebSocket 推送到客户端，并处理消息状态更新
            //  这部分逻辑更适合放在 WebSocket 服务中处理，controller 负责接收 HTTP 请求和初步处理
        }
        catch (error) {
            console.error('Error sending message:', error);
            res.status(500).json({ error: 'Failed to send message' });
        }
    }));
    //  更新消息状态 (例如，标记消息为已读，或者更新发送状态)
    app.put('/messages/:messageId/status', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const messageId = req.params.messageId;
            const { status } = req.body;
            yield messageService.updateMessageStatus(messageId, status);
            res.json({ message: 'Message status updated successfully' });
        }
        catch (error) {
            console.error('Error updating message status:', error);
            res.status(500).json({ error: 'Failed to update message status' });
        }
    }));
    //  ... 获取消息历史，更新消息内容等路由
};
exports.setupMessageController = setupMessageController;
