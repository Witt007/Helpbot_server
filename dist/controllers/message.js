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
const ChatService_1 = require("../services/ChatService");
const crypto = __importStar(require("node:crypto"));
function verifySignature(signature, timestamp, nonce, echostr) {
    // TODO: 在此处完成签名算法验证逻辑
    // 例如和你的 token 一起进行 SHA1 校验等
    // 返回 true 表示验证通过
    // 计算签名
    const TOKEN = '你的Token占位符';
    const hash = crypto.createHash('sha1');
    const sortedParams = [TOKEN, timestamp, nonce].sort().join('');
    hash.update(sortedParams);
    const mySignature = hash.digest('hex');
    // 对比签名，一致则返回 echostr 给微信服务器
    if (mySignature === signature) {
        return echostr;
    }
    else {
        return 'error';
    }
    return true;
}
const setupMessageController = (app) => {
    const chatService = new ChatService_1.ChatService();
    app.get('/api/push', (req, res) => {
        console.log('Received GET request for /api/push', req.query, req.headers);
        return res.send('hello');
    });
    app.post('/api/push', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { signature, timestamp, nonce, echostr } = req.query;
            console.log('Received POST request for /api/push', req.query, req.headers, req.body);
            // 如果需要签名验证，可在此调用验证方法
            if (!verifySignature(signature, timestamp, nonce, echostr)) {
                return res.status(403).json({ success: false, message: '签名验证失败' });
            }
            // 获取推送的主体数据
            const data = req.body;
            // 这里可以根据推送内容（如文本消息、事件消息等）进行不同的业务处理
            // 示例：存储消息到数据库，或根据消息类型触发特定逻辑
            // 返回处理成功
            return res.status(200).json({ success: true, message: '消息接收成功' });
        }
        catch (error) {
            console.error('Error handling push message:', error);
            return res.status(500).json({ success: false, message: '服务器端错误' });
        }
    }));
    // 发送消息 (初始消息，通过 HTTP 触发，然后切换到 WebSocket 流式接收)
    app.post('/api/messages', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { conversationId, content } = req.body;
            const openId = req.headers['x-wx-openid'];
            const message = yield chatService.sendMessage({
                conversationId,
                content,
                role: 'user',
                openId
            });
            res.json({ success: true, message });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : '未知错误';
            res.status(500).json({ success: false, error: errorMessage });
        }
    }));
    app.delete('/api/messages', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const openId = req.headers['x-wx-openid'];
            const { ids } = req.body;
            const message = yield chatService.deleteMessage(ids);
            res.json({ success: true, message });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : '未知错误';
            res.status(500).json({ success: false, error: errorMessage });
        }
    }));
    //  更新消息状态 (例如，标记消息为已读，或者更新发送状态)
    /*   app.put('/messages/:messageId/status', async (req: Request, res: Response) => {
          try {
              const messageId = Number(req.params.messageId);
              const { status } = req.body;
              await chatService.(messageId, status);
              res.json({ message: 'Message status updated successfully' });
          } catch (error) {
              console.error('Error updating message status:', error);
              res.status(500).json({ error: 'Failed to update message status' });
          }
      }); */
    // 获取用户消息历史
    app.get('/api/messages', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const openId = req.headers['x-wx-openid'];
            const offset = parseInt(req.query.offset) || 0;
            const limit = parseInt(req.query.limit) || 10;
            // Validate openId
            if (!openId) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing openId in headers'
                });
            }
            const messages = yield chatService.getUserMessages(openId, offset, limit);
            if (!messages) {
                return res.status(404).json({
                    success: false,
                    error: 'No messages found'
                });
            }
            res.json({ success: true, messages });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : '未知错误';
            res.status(500).json({ success: false, error: errorMessage });
        }
    }));
    // 创建新的引导式话题
    app.post('/api/topics/generate', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const openId = req.headers['x-wx-openid'];
            const topic = req.body.topic;
            // 调用 chatService 生成新话题
            const conversationId = yield chatService.generateNewTopic(openId, topic);
            res.json({ success: true, conversationId });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : '未知错误';
            res.status(500).json({ success: false, error: errorMessage });
        }
    }));
    // 更新消息内容
    app.put('/api/messages/:messageId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const messageId = req.params.messageId;
            const openId = req.headers['x-wx-openid'];
            const { content } = req.body;
            const updatedMessage = yield chatService.updateMessage(messageId, content);
            res.json({ success: true, message: updatedMessage });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : '未知错误';
            res.status(500).json({ success: false, error: errorMessage });
        }
    }));
    // 获取下一步建议问题
    app.get('/api/getquestions', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const openId = req.headers['x-wx-openid'];
            const suggestions = yield chatService.getNextSuggestions(openId);
            res.json({ success: true, suggestions });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : '未知错误';
            res.status(500).json({ success: false, error: errorMessage });
        }
    }));
    // 获取消息历史，更新消息内容等路由
    /*     app.get('/api/messages/:messageId/stream', async (req: Request, res: Response) => {
            const messageId = parseInt(req.params.messageId);
            const openId = req.query.openId as string;
    
            // 设置 SSE headers
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');
    
            const message = await chatService.getMessageWithStream(messageId);
            
            // 定期检查消息更新
            const interval = setInterval(async () => {
                const updates = await chatService.getMessageUpdates(messageId);
                if (updates) {
                    res.write(`data: ${JSON.stringify(updates)}\n\n`);
                }
                if (updates.isComplete) {
                    clearInterval(interval);
                    res.end();
                }
            }, 1000);
    
            // 处理客户端断开连接
            req.on('close', () => {
                clearInterval(interval);
            });
        }); */
};
exports.setupMessageController = setupMessageController;
