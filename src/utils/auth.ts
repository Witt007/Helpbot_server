import jwt from 'jsonwebtoken';
import { config } from '../config';

interface TokenPayload {
    openId: string;
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
    try {
        const decoded = jwt.verify(token, config.jwt.secret) as TokenPayload;
        return decoded;
    } catch (error) {
        return null;
    }
} 