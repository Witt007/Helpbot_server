import WebSocket from 'ws';
import { Server } from 'http';
import { WebSocketService } from '../services/WebSocketService';
import { logger } from '../utils/logger';
import { verifyToken } from '../utils/auth';

export function setupWebSocketServer(server: Server, wsService: WebSocketService) {
    const wss = new WebSocket.Server({ server });

    wss.on('connection', async (ws: WebSocket, req) => {
        try {
            // 从 URL 查询参数中获取 token
            const url = new URL(req.url || '', 'ws://localhost');
            const token = url.searchParams.get('token');
            
            if (!token) {
                ws.close(1008, '缺少认证信息');
                return;
            }

            // 验证 token 并获取用户信息
            const user = await verifyToken(token);
            if (!user) {
                ws.close(1008, '认证失败');
                return;
            }

            // 将 WebSocket 连接与用户 openId 关联
            wsService.addClient(user.openId, ws);
            logger.info('WebSocket 客户端已连接', { openId: user.openId });

            // 处理连接关闭
            ws.on('close', () => {
                wsService.removeClient(user.openId);
                logger.info('WebSocket 客户端已断开', { openId: user.openId });
            });

            // 处理连接错误
            ws.on('error', (error) => {
                logger.error('WebSocket 连接错误', { error, openId: user.openId });
                wsService.removeClient(user.openId);
            });

        } catch (error) {
            logger.error('WebSocket 连接处理失败', { error });
            ws.close(1011, '服务器错误');
        }
    });

    return wss;
} 