import { logger } from './logger';

export class Cache {
    private static cache: Map<string, { value: any; expiry?: number }> = new Map();
    private prefix: string;

    constructor(prefix: string = 'app:') {
        this.prefix = prefix;
    }

    private getKey(key: string): string {
        return `${this.prefix}${key}`;
    }

    async get<T>(key: string): Promise<T | null> {
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
        } catch (error) {
            logger.error('缓存获取失败', { error, key });
            return null;
        }
    }

    async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
        try {
            const fullKey = this.getKey(key);
            Cache.cache.set(fullKey, {
                value,
                expiry: ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined
            });
        } catch (error) {
            logger.error('缓存设置失败', { error, key });
        }
    }

    async del(key: string): Promise<void> {
        try {
            Cache.cache.delete(this.getKey(key));
        } catch (error) {
            logger.error('缓存删除失败', { error, key });
        }
    }

    // 清理过期缓存
    static cleanExpired(): void {
        const now = Date.now();
        for (const [key, item] of Cache.cache.entries()) {
            if (item.expiry && item.expiry < now) {
                Cache.cache.delete(key);
            }
        }
    }
}

// 定期清理过期缓存（每小时）
setInterval(() => Cache.cleanExpired(), 3600000); 