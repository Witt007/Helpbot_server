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
const message_1 = require("../services/message");
const setupWebSocketServer = (server) => {
    const wss = new ws_1.default.Server({ server });
    wss.on('connection', (ws) => {
        console.log('WebSocket connection established');
        ws.on('message', (messageStr) => __awaiter(void 0, void 0, void 0, function* () {
            console.log('Received message:', messageStr);
            try {
                const messageData = JSON.parse(messageStr.toString());
                const { type, payload } = messageData;
                switch (type) {
                    case 'sendMessage': {
                        const { userId, conversationId, messageContent } = payload;
                        const { messageId, stream } = yield (0, message_1.sendMessageToAI)(userId, conversationId, messageContent);
                        if (stream) {
                            stream.on('data', (chunk) => {
                                const messageChunk = chunk.toString('utf-8');
                                console.log('Dify Stream Chunk:', messageChunk);
                                ws.send(JSON.stringify({ type: 'messageChunk', payload: { messageId, chunk: messageChunk } })); // 推送消息块到客户端
                            });
                            stream.on('end', () => {
                                console.log('Dify Stream ended');
                                ws.send(JSON.stringify({ type: 'messageEnd', payload: { messageId } })); //  通知客户端消息流结束
                            });
                            stream.on('error', (error) => {
                                console.error('Dify Stream error:', error);
                                ws.send(JSON.stringify({ type: 'messageError', payload: { messageId, error: error.message } })); //  通知客户端流错误
                            });
                        }
                        break;
                    }
                    //  TODO:  处理其他 WebSocket 消息类型，例如语音转文字请求，消息更新确认等
                    case 'speechToText': {
                        //  ... 调用语音转文字服务 (可以使用 Dify 的功能，或者其他语音转文字 API)
                        break;
                    }
                    default:
                        console.warn('Unknown message type:', type);
                        ws.send(JSON.stringify({ type: 'error', payload: { message: 'Unknown message type' } }));
                }
            }
            catch (error) {
                console.error('WebSocket message processing error:', error);
                if (error instanceof Error) {
                    ws.send(JSON.stringify({ type: 'error', payload: { message: 'Failed to process message', error: error.message } }));
                }
                else {
                    ws.send(JSON.stringify({ type: 'error', payload: { message: 'Failed to process message', error: 'Unknown error' } }));
                }
            }
        }));
        ws.on('close', () => {
            console.log('WebSocket connection closed');
        });
        ws.on('error', (error) => {
            console.error('WebSocket error:', error);
        });
    });
    console.log('WebSocket server started');
};
exports.setupWebSocketServer = setupWebSocketServer;
