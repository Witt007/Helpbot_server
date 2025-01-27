import { Express, Request, Response, Router } from 'express';
import {WxUserService} from '../services/WxUserService';
import { userService  from '../services/user';


export const setupUserController = (app: Express) => {
    // 创建用户
    app.post('/users', async (req: Request, res: Response) => {
        try {
            const { avatarUrl } = req.body;
            const openId = req.headers['x-wx-openid'] as string;
            const userId = await WxUserService.getInstance().loginUser(openId,avatarUrl);
            res.status(201).json({ userId, message: 'User created successfully' });
        } catch (error) {
            console.error('Error creating user:', error);
            res.status(500).json({ error: 'Failed to create user' });
        }
    });

    // 获取用户
    app.get('/users/:userId', async (req: Request, res: Response) => {
        try {
            const userId = req.params.userId;
            const user = await userService.getUserById(userId);
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
    app.put('/users/:userId', async (req: Request, res: Response) => {
        try {
            const userId = req.params.userId;
            const { username, email } = req.body;
            await userService.updateUser(userId, username, email);
            res.json({ message: 'User updated successfully' });
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