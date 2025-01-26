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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cache = void 0;
const logger_1 = require("./logger");
class Cache {
    constructor(prefix = 'app:') {
        this.prefix = prefix;
    }
    getKey(key) {
        return `${this.prefix}${key}`;
    }
    get(key) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const fullKey = this.getKey(key);
                const item = Cache.cache.get(fullKey);
                if (!item) {
                    return null;
                }
                // 检查是否过期
                if (item.expiry && item.expiry < Date.now()) {
                    Cache.cache.delete(fullKey);
                    return null;
                }
                return item.value;
            }
            catch (error) {
                logger_1.logger.error('缓存获取失败', { error, key });
                return null;
            }
        });
    }
    set(key, value, ttlSeconds) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const fullKey = this.getKey(key);
                Cache.cache.set(fullKey, {
                    value,
                    expiry: ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined
                });
            }
            catch (error) {
                logger_1.logger.error('缓存设置失败', { error, key });
            }
        });
    }
    del(key) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                Cache.cache.delete(this.getKey(key));
            }
            catch (error) {
                logger_1.logger.error('缓存删除失败', { error, key });
            }
        });
    }
    // 清理过期缓存
    static cleanExpired() {
        const now = Date.now();
        for (const [key, item] of Cache.cache.entries()) {
            if (item.expiry && item.expiry < now) {
                Cache.cache.delete(key);
            }
        }
    }
}
exports.Cache = Cache;
Cache.cache = new Map();
// 定期清理过期缓存（每小时）
setInterval(() => Cache.cleanExpired(), 3600000);
