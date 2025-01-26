export interface WxUser {
    id: number;
    openId: string;
    unionId?: string;
    sessionKey?: string;
    nickName?: string;
    avatarUrl?: string;
    lastLoginTime?: Date;
    createdAt: Date;
    updatedAt: Date;
} 