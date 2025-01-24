"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const ws_server_1 = require("./websocket/ws_server");
const user_1 = require("./controllers/user");
const message_1 = require("./controllers/message");
const database_1 = require("./database");
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
// 初始化数据库连接 (假设使用 MySQL)
(0, database_1.initDatabase)();
// 配置 Express 中间件 (例如 JSON 解析)
app.use(express_1.default.json());
// 设置 HTTP 路由
(0, user_1.setupUserController)(app);
(0, message_1.setupMessageController)(app);
// 设置 WebSocket 服务器
(0, ws_server_1.setupWebSocketServer)(server);
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
