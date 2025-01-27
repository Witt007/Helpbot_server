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
import express from 'express';
import cors from 'cors';
import http from 'http';

const app = express();
const server = http.createServer(app);

// 使用单例获取 WebSocket 服务实例
const wsService = WebSocketService.getInstance();

// 初始化数据库
async function initialize() {
    try {
        await initDatabase();
        
        // Add CORS middleware
        app.use(cors());
        
        // 配置 Express 中间件
        app.use(express.json());

        // Add request logging
        app.use((req, res, next) => {
            console.log(`${req.method} ${req.url}`);
            next();
        });

        // Add health check endpoint
        app.get('/health', (req, res) => {
            res.status(200).json({ status: 'ok' });
        });

        // 设置 HTTP 路由
        setupUserController(app);
        setupMessageController(app); // Uncommented this line

        // 设置 WebSocket 服务器
        setupWebSocketServer(server, wsService);

        // Add error handling middleware
        app.use((req, res) => {
            res.status(404).json({ error: 'Not Found' });
        });

        app.use((err, req, res, next) => {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
        });

        const PORT = process.env.PORT || 3000;
        server.listen(PORT, () => {
            console.log(`服务器运行在端口 ${PORT}`);
        });
    } catch (error) {
        console.error('服务器初始化失败:', error);
        process.exit(1);
    }
}

initialize();
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
