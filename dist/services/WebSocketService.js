"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketService = void 0;
const ws_1 = __importDefault(require("ws"));
const logger_1 = require("../utils/logger");
class WebSocketService {
    constructor() {
        this.connections = new Map();
        this.heartbeats = new Map();
    }
    static getInstance() {
        if (!WebSocketService.instance) {
            WebSocketService.instance = new WebSocketService();
        }
        return WebSocketService.instance;
    }
    addClient(openId, ws) {
        // 如果已存在连接，先清理旧连接
        this.removeClient(openId);
        this.connections.set(openId, ws);
        this.startHeartbeat(openId);
        // 处理心跳消息
        ws.on('message', (data) => {
            try {
                const message = JSON.parse(data.toString());
                if (message.type === 'ping') {
                    ws.send(JSON.stringify({ type: 'pong' }));
                }
            }
            catch (error) {
                logger_1.logger.error('处理 WebSocket 消息失败', { error, openId });
            }
        });
    }
    removeClient(openId) {
        const client = this.connections.get(openId);
        if (client) {
            client.close();
            this.connections.delete(openId);
        }
        const heartbeat = this.heartbeats.get(openId);
        if (heartbeat) {
            clearInterval(heartbeat);
            this.heartbeats.delete(openId);
        }
    }
    isConnected(openId) {
        const client = this.connections.get(openId);
        return (client === null || client === void 0 ? void 0 : client.readyState) === ws_1.default.OPEN;
    }
    sendMessage(openId, message) {
        const client = this.connections.get(openId);
        if ((client === null || client === void 0 ? void 0 : client.readyState) === ws_1.default.OPEN) {
            try {
                client.send(JSON.stringify(message));
                return true;
            }
            catch (error) {
                logger_1.logger.error('WebSocket 消息发送失败', { error, openId });
                this.removeClient(openId);
                return false;
            }
        }
        return false;
    }
    // 添加心跳检测
    startHeartbeat(openId) {
        const client = this.connections.get(openId);
        if (client) {
            const interval = setInterval(() => {
                if (client.readyState === ws_1.default.OPEN) {
                    client.ping();
                }
                else {
                    this.removeClient(openId);
                }
            }, 30000);
            this.heartbeats.set(openId, interval);
        }
    }
}
exports.WebSocketService = WebSocketService;
