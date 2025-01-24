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
exports.streamDifyChat = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const config_1 = require("../config");
const DIFY_API_URL = config_1.config.dify.apiUrl;
const DIFY_API_KEY = config_1.config.dify.apiKey;
const streamDifyChat = (inputs, query, conversationId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const headers = {
        'Authorization': `Bearer ${DIFY_API_KEY}`,
        'Content-Type': 'application/json',
    };
    const body = JSON.stringify({
        inputs: inputs,
        query: query,
        conversation_id: conversationId,
        user: userId,
    });
    try {
        const response = yield (0, node_fetch_1.default)(`${DIFY_API_URL}/chat-messages`, {
            method: 'POST',
            headers: headers,
            body: body,
        });
        if (!response.ok) {
            console.error('Dify API error:', response.status, response.statusText);
            throw new Error(`Dify API request failed: ${response.status} ${response.statusText}`);
        }
        return response.body; // 返回 ReadableStream 用于流式处理
    }
    catch (error) {
        console.error('Error calling Dify API:', error);
        throw error;
    }
});
exports.streamDifyChat = streamDifyChat;
// ... 可以添加其他 Dify API 相关的封装，例如语音转文字 (如果 Dify 提供) 
