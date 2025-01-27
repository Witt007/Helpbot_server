import { WxUserModel } from '../models/WxUserModel';
import { WxUser } from '../entities/WxUser';

export class WxUserService {
    private userModel = new WxUserModel();

    async loginUser(
        openId: string,avatarUrl:string): Promise<boolean> {
        let user = await this.userModel.findByOpenId(openId);
        
        if (!user) {
            user = await this.userModel.create({
                openId: wxLoginData.openId,
                unionId: wxLoginData.unionId,
                sessionKey: wxLoginData.sessionKey
            });
        } else {
            await this.userModel.updateLastLogin(wxLoginData.openId);
        }
        
        return true;
    }

    private static ins: WxUserService | null = null;
    static getInstance() {
        if (!this.ins) {
            this.ins = new WxUserService();
        }
        return this.ins
    }
} 