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
exports.MessageModel = void 0;
const db_1 = __importDefault(require("../database/db"));
class MessageModel {
    create(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const [result] = yield db_1.default.query('INSERT INTO messages (id, conversation_id, role, status, content) VALUES (?, ?, ?, ?, ?)', [message.id, message.conversationId, message.role, message.status, message.content]);
            const created = yield this.findById(message.id);
            if (!created)
                throw new Error('Failed to create message');
            return created;
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const [rows] = yield db_1.default.query('SELECT * FROM messages WHERE id = ?', [id]);
            return rows[0] || null;
        });
    }
    findByConversationId(conversationId) {
        return __awaiter(this, void 0, void 0, function* () {
            const [rows] = yield db_1.default.query('SELECT * FROM messages WHERE conversation_id = ? order by sort_index desc', [conversationId]);
            return rows;
        });
    }
    updateStatus(id, status) {
        return __awaiter(this, void 0, void 0, function* () {
            const [result] = yield db_1.default.query('UPDATE messages SET status = ? WHERE id = ?', [status, id]);
        });
    }
    findUserMessages(openId, offset, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `
            SELECT m.* 
            FROM messages m
            JOIN chat_sessions cs ON m.conversation_id = cs.id
            WHERE cs.open_id = ?
            ORDER BY m.sort_index DESC
            LIMIT ? OFFSET ?
        `;
            const [messages] = yield db_1.default.query(query, [openId, limit, offset]);
            return messages;
        });
    }
    updateContent(id, content) {
        return __awaiter(this, void 0, void 0, function* () {
            const [result] = yield db_1.default.query('UPDATE messages SET content = ? WHERE id = ?', [content, id]);
            if (result.affectedRows === 0) {
                throw new Error(`未能更新ID为 ${id} 的消息`);
            }
        });
    }
    // 假设函数签名修改为根据多个 messageId 批量删除
    deleteLatestMessagesByIds(ids) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!ids || ids.length === 0) {
                // 如果不传或传入空数组，则无需删除
                return 0;
            }
            // 构造适合 MySQL 的占位符
            const placeholders = ids.map(() => '?').join(',');
            const query = `
            DELETE
            FROM messages
            WHERE id IN (${placeholders})
        `;
            // 执行批量删除
            const [result] = yield db_1.default.query(query, ids);
            // 可根据受影响的行数进行后续处理，比如日志记录
            console.log('Deleted messages count:', result.affectedRows);
            return result.affectedRows;
        });
    }
}
exports.MessageModel = MessageModel;
