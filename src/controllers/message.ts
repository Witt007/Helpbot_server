import { Express, Request, Response } from 'express';
import * as messageService from '../services/message';

export const setupMessageController = (app: Express) => {
    // 发送消息 (初始消息，通过 HTTP 触发，然后切换到 WebSocket 流式接收)
    app.post('/messages', async (req: Request, res: Response) => {
        try {
            const { userId, conversationId, messageContent } = req.body;
            const { messageId, stream } = await messageService.sendMessageToAI(userId, conversationId, messageContent);

            //  这里只是启动 Dify 流，实际流式数据推送需要通过 WebSocket
            //  可以返回 messageId 给客户端，客户端通过 WebSocket 监听消息更新
            res.status(202).json({ messageId, message: 'Message processing started, will be streamed via WebSocket' });

            //  TODO:  将 stream 通过 WebSocket 推送到客户端，并处理消息状态更新
            //  这部分逻辑更适合放在 WebSocket 服务中处理，controller 负责接收 HTTP 请求和初步处理
        } catch (error) {
            console.error('Error sending message:', error);
            res.status(500).json({ error: 'Failed to send message' });
        }
    });

    //  更新消息状态 (例如，标记消息为已读，或者更新发送状态)
    app.put('/messages/:messageId/status', async (req: Request, res: Response) => {
        try {
            const messageId = req.params.messageId;
            const { status } = req.body;
            await messageService.updateMessageStatus(messageId, status);
            res.json({ message: 'Message status updated successfully' });
        } catch (error) {
            console.error('Error updating message status:', error);
            res.status(500).json({ error: 'Failed to update message status' });
        }
    });

    //  ... 获取消息历史，更新消息内容等路由
}; 