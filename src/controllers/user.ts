import {Express, Request, Response} from 'express';
import {WxUserService} from '../services/WxUserService';
import * as userService from '../services/user';
import axios from "axios";
import * as https from "node:https";


export const setupUserController = (app: Express) => {
    // 创建用户
    app.post('/users', async (req: Request, res: Response) => {
        try {
            const {avatarUrl} = req.body;
            const openId = req.headers['x-wx-openid'] as string;
            const userId = await WxUserService.getInstance().loginUser(openId, avatarUrl);
            res.status(201).json({ userId, message: 'User created successfully' });
        } catch (error) {
            console.error('Error creating user:', error);
            res.status(500).json({ error: 'Failed to create user' });
        }
    });

    // 获取用户
    app.get('/users', async (req: Request, res: Response) => {
        try {
            const openId = req.headers['x-wx-openid'] as string;
            const user = await WxUserService.getInstance().findUserByOpenId(openId);
            if (user) {
                res.json(user);
            } else {
                res.status(404).json({ message: 'User not found' });
            }
        } catch (error) {
            console.error('Error getting user:', error);
            res.status(500).json({ error: 'Failed to get user' });
        }
    });

    // 更新用户
    app.put('/users', async (req: Request, res: Response) => {
        try {
            const openId = req.headers['x-wx-openid'] as string;
            const {code, url} = req.body;
            let phonenumber = '';
            let success = false;
            if (code) {
                if (code) {
                    try {
                        const wxPhoneApiUrl = `https://api.weixin.qq.com/wxa/business/getuserphonenumber`; // Replace with the actual API URL.
                        const response = await axios.post(wxPhoneApiUrl, {code}, {
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            httpsAgent: new https.Agent({rejectUnauthorized: false})
                        });
                        console.log('getphonenum', response.data);
                        if (response.data.errmsg == 'ok') {
                            phonenumber = response.data.phone_info.phoneNumber || ''; // Update 'phoneNumber' based on API response structure.
                            await WxUserService.getInstance().updateUserPhone(openId, phonenumber);
                            success = true;
                        }

                    } catch (e) {
                        console.log(e);
                    }

                }
            } else if (url) {
                try {
                    await WxUserService.getInstance().updateUserAvatar(openId, url);
                    success = true;
                } catch (e) {
                    console.log(e);
                }
            }
            res.json({success});
        } catch (error) {
            console.error('Error updating user:', error);
            res.status(500).json({ error: 'Failed to update user' });
        }
    });

    // 删除用户
    app.delete('/users/:userId', async (req: Request, res: Response) => {
        try {
            const userId = req.params.userId;
            await userService.deleteUser(userId);
            res.json({ message: 'User deleted successfully' });
        } catch (error) {
            console.error('Error deleting user:', error);
            res.status(500).json({ error: 'Failed to delete user' });
        }
    });

    // 获取所有用户
    app.get('/users', async (req: Request, res: Response) => {
        try {
            const users = await userService.getAllUsers();
            res.json(users);
        } catch (error) {
            console.error('Error getting all users:', error);
            res.status(500).json({ error: 'Failed to get users' });
        }
    });

    // ... 用户登录，登出等路由
}; 