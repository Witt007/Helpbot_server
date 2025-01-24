import express from 'express';
import http from 'http';
import { setupWebSocketServer } from './websocket/ws_server';
import { setupUserController } from './controllers/user';
import { setupMessageController } from './controllers/message';
import { initDatabase } from './database';

const app = express();
const server = http.createServer(app);

// 初始化数据库连接 (假设使用 MySQL)
initDatabase();

// 配置 Express 中间件 (例如 JSON 解析)
app.use(express.json());

// 设置 HTTP 路由
setupUserController(app);
setupMessageController(app);


// 设置 WebSocket 服务器
setupWebSocketServer(server);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
