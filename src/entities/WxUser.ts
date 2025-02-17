export interface WxUser {
    id: number;
    openId: string;
    unionId?: string;
    sessionKey?: string;
    nickName?: string;
    avatarUrl?: string;
    phone?: string;
    sex?: '0' | '1';
    lastLoginTime?: Date;
    createdAt: Date;
    updatedAt: Date;
} 