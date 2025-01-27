import express from 'express';
import http from 'http';
import { setupWebSocketServer } from './websocket/server';
import { setupUserController } from './controllers/user';
import { setupMessageController } from './controllers/message';
import { initDatabase } from './database/db';
import { WebSocketService } from './services/WebSocketService';


const app = express();
const server = http.createServer(app);

// 使用单例获取 WebSocket 服务实例
const wsService = WebSocketService.getInstance();

// 初始化数据库
async function initialize() {
    try {
        await initDatabase();
        // 配置 Express 中间件 (例如 JSON 解析)
        app.use(express.json());

        app.use(cors());

        // 设置 HTTP 路由
        setupUserController(app);
       // setupMessageController(app);

        // 设置 WebSocket 服务器
        setupWebSocketServer(server, wsService);

        const PORT = process.env.PORT || 3000;
        server.listen(PORT, () => {
            console.log(`服务器运行在端口 ${PORT}`);
        });
    } catch (error) {
        console.error('服务器初始化失败:', error);
        process.exit(1);
    }
}

// 启动应用
initialize();

export { wsService }; // 导出 wsService 实例供其他模块使用
