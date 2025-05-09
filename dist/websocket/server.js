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
exports.setupWebSocketServer = void 0;
const ws_1 = __importDefault(require("ws"));
const logger_1 = require("../utils/logger");
function setupWebSocketServer(server, wsService) {
    const wss = new ws_1.default.Server({ server });
    wss.on('connection', (ws, req) => __awaiter(this, void 0, void 0, function* () {
        try {
            // 从 URL 查询参数中获取 token
            const url = new URL(req.url || '', 'ws://localhost');
            const token = url.searchParams.get('token');
            const openId = req.headers['x-wx-openid'];
            /*   if (!token) {
                  ws.close(1008, '缺少认证信息');
                  return;
              }
  
              // 验证 token 并获取用户信息
              const user = await verifyToken(token);
              if (!user) {
                  ws.close(1008, '认证失败');
                  return;
              } */
            ws.send(JSON.stringify({
                type: "announcement",
                data: { content: ' 欢迎了解我们的产品！请选择下方按钮开始了解详情。' }
            }));
            // 将 WebSocket 连接与用户 openId 关联
            wsService.addClient(openId, ws);
            logger_1.logger.info('WebSocket 客户端已连接', { openId });
            // 处理连接关闭
            ws.on('close', () => {
                wsService.removeClient(openId);
                logger_1.logger.info('WebSocket 客户端已断开', { openId });
            });
            // 处理连接错误
            ws.on('error', (error) => {
                logger_1.logger.error('WebSocket 连接错误', { error, openId });
                wsService.removeClient(openId);
            });
        }
        catch (error) {
            logger_1.logger.error('WebSocket 连接处理失败', { error });
            ws.close(1011, '服务器错误');
        }
    }));
    return wss;
}
exports.setupWebSocketServer = setupWebSocketServer;
