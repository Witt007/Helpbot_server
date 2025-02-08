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
exports.DifyService = void 0;
const axios_1 = __importDefault(require("axios"));
const config_1 = require("../config");
class DifyService {
    constructor() {
        this.apiKey = config_1.config.dify.apiKey;
        this.baseUrl = config_1.config.dify.apiUrl;
    }
    streamChat(params) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // 构建上下文消息
                const el = params.history[Math.max(0, params.history.length - 1)];
                params.history = el ? [el] : [];
                const contextMessage = params.history
                    .map(msg => `${msg.role === 'user' ? '用户' : 'AI助手'}: ${msg.content}`)
                    .join('\n');
                // 将历史记录作为上下文添加到查询中
                const fullQuery = params.history.length > 0
                    ? `${contextMessage}\n用户: ${params.query}`
                    : params.query;
                const response = yield axios_1.default.post(`${this.baseUrl}/chat-messages`, {
                    inputs: {},
                    query: fullQuery,
                    response_mode: 'streaming',
                    conversation_id: params.conversationId,
                    user: params.openId,
                    // 移除 history 参数
                }, {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    responseType: 'stream'
                });
                return response.data;
            }
            catch (error) {
                throw new Error('调用 Dify API 失败');
            }
        });
    }
}
exports.DifyService = DifyService;
