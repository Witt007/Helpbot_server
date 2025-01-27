import Joi from 'joi';
import { ValidationError } from '../types/errors';

export const validators = {
    wxUser: Joi.object({
        openId: Joi.string().required(),
        unionId: Joi.string().allow(null),
        sessionKey: Joi.string().allow(null),
        nickName: Joi.string().max(100).allow(null),
        avatarUrl: Joi.string().uri().allow(null)
    }),

    message: Joi.object({
        conversationId: Joi.string().required(),
        content: Joi.string().required(),
        role: Joi.string().valid('user', 'assistant').required()
    }),
    chatSession: Joi.object({
        openId: Joi.string().required(),
        title: Joi.string().max(255).allow(null)
    })
};

export const validate = async (schema: Joi.Schema, data: any) => {
    try {
        return await schema.validateAsync(data, { abortEarly: false });
    } catch (error) {
        if (error instanceof Joi.ValidationError) {
            throw new ValidationError('数据验证失败', error.details);
        }
        throw error;
    }
}; 