import {WxUserModel} from '../models/WxUserModel';
import {WxUser} from '../entities/WxUser';

export class WxUserService {
    private userModel = new WxUserModel();

    async loginUser(
        openId: string, avatarUrl: string = '', phone: string): Promise<boolean> {
        let user = await this.userModel.findByOpenId(openId);
        
        if (!user) {
            user = await this.userModel.create({
                openId: openId, avatarUrl, phone
            });
        } else {
           // await this.userModel.updateLastLogin(wxLoginData.openId);
        }
        
        return true;
    }

    async findUserByOpenId(openId: string): Promise<WxUser | null> {
        return await this.userModel.findByOpenId(openId);
    }

    private static ins: WxUserService | null = null;
    static getInstance() {
        if (!this.ins) {
            this.ins = new WxUserService();
        }
        return this.ins
    }
} 