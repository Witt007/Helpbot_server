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
exports.WxUserModel = void 0;
const db_1 = __importDefault(require("../database/db"));
class WxUserModel {
    create(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const [result] = yield db_1.default.query('INSERT INTO wx_users (open_id, avatar_url, phone) VALUES (?, ?,?)', [user.openId, user.avatarUrl, user.phone]);
            const created = yield this.findByOpenId(user.openId);
            if (!created)
                throw new Error('Failed to create user');
            return created;
        });
    }
    findByOpenId(openId) {
        return __awaiter(this, void 0, void 0, function* () {
            const [rows] = yield db_1.default.query('SELECT * FROM wx_users WHERE open_id = ?', [openId]);
            return rows[0] || null;
        });
    }
    updateLastLogin(openId) {
        return __awaiter(this, void 0, void 0, function* () {
            const [result] = yield db_1.default.query('UPDATE wx_users SET last_login_time = CURRENT_TIMESTAMP WHERE open_id = ?', [openId]);
        });
    }
    updateUserPhone(openId, phonenumber) {
        return __awaiter(this, void 0, void 0, function* () {
            const [result] = yield db_1.default.query('UPDATE wx_users SET phone = ? WHERE open_id = ?', [phonenumber, openId]);
            return result;
        });
    }
    updateUserAvatar(openId, url) {
        return __awaiter(this, void 0, void 0, function* () {
            const [result] = yield db_1.default.query('UPDATE wx_users SET avatar_url = ? WHERE open_id = ?', [url, openId]);
            return result;
        });
    }
}
exports.WxUserModel = WxUserModel;
