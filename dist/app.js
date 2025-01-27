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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.wsService = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const body_parser_1 = __importDefault(require("body-parser"));
const server_1 = require("./websocket/server");
const user_1 = require("./controllers/user");
const message_1 = require("./controllers/message");
const db_1 = require("./database/db");
const WebSocketService_1 = require("./services/WebSocketService");
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
// 使用单例获取 WebSocket 服务实例
const wsService = WebSocketService_1.WebSocketService.getInstance();
exports.wsService = wsService;
// 初始化数据库
function initialize() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield (0, db_1.initDatabase)();
            // 配置 Express 中间件 (例如 JSON 解析)
            app.use(express_1.default.json());
            app.use((0, cors_1.default)());
            app.use((req, res, next) => {
                console.log(`${req.method} ${req.url}`);
                next();
            });
            // Parse JSON bodies
            app.use(body_parser_1.default.json());
            // Parse URL-encoded bodies
            app.use(body_parser_1.default.urlencoded({ extended: true }));
            // 设置 HTTP 路由
            (0, user_1.setupUserController)(app);
            (0, message_1.setupMessageController)(app);
            // 设置 WebSocket 服务器
            (0, server_1.setupWebSocketServer)(server, wsService);
            const PORT = process.env.PORT || 3000;
            server.listen(PORT, () => {
                console.log(`服务器运行在端口 ${PORT}`);
            });
        }
        catch (error) {
            console.error('服务器初始化失败:', error);
            process.exit(1);
        }
    });
}
// 启动应用
initialize();
