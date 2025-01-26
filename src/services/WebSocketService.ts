import WebSocket from 'ws';
import { logger } from '../utils/logger';

interface WSMessage {
    type: string;
    data: any;
}

export class WebSocketService {
    private static instance: WebSocketService;
    private connections: Map<string, WebSocket>;
    private heartbeats: Map<string, NodeJS.Timeout>;

    private constructor() {
        this.connections = new Map();
        this.heartbeats = new Map();
    }

    public static getInstance(): WebSocketService {
        if (!WebSocketService.instance) {
            WebSocketService.instance = new WebSocketService();
        }
        return WebSocketService.instance;
    }

    addClient(openId: string, ws: WebSocket): void {
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
            } catch (error) {
                logger.error('处理 WebSocket 消息失败', { error, openId });
            }
        });
    }

    removeClient(openId: string): void {
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

    isConnected(openId: string): boolean {
        const client = this.connections.get(openId);
        return client?.readyState === WebSocket.OPEN;
    }

    sendMessage(openId: string, message: WSMessage): boolean {
        const client = this.connections.get(openId);
        if (client?.readyState === WebSocket.OPEN) {
            try {
                client.send(JSON.stringify(message));
                return true;
            } catch (error) {
                logger.error('WebSocket 消息发送失败', { error, openId });
                this.removeClient(openId);
                return false;
            }
        }
        return false;
    }

    // 添加心跳检测
    startHeartbeat(openId: string): void {
        const client = this.connections.get(openId);
        if (client) {
            const interval = setInterval(() => {
                if (client.readyState === WebSocket.OPEN) {
                    client.ping();
                } else {
                    this.removeClient(openId);
                }
            }, 30000);
            
            this.heartbeats.set(openId, interval);
        }
    }
} 