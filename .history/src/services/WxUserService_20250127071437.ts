import { WxUserModel } from '../models/WxUserModel';
import { WxUser } from '../entities/WxUser';

export class WxUserService {
    private userModel = new WxUserModel();

    async loginUser(wxLoginData: {
        openId: string;
        unionId?: string;
        sessionKey: string;
    }): Promise<WxUser> {
        let user = await this.userModel.findByOpenId(wxLoginData.openId);
        
        if (!user) {
            user = await this.userModel.create({
                openId: wxLoginData.openId,
                unionId: wxLoginData.unionId,
                sessionKey: wxLoginData.sessionKey
            });
        } else {
            await this.userModel.updateLastLogin(wxLoginData.openId);
        }
        
        return user;
    }

    private 
    static getInstance() {
        return new WxUserService();
    }
} 