"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = exports.validators = void 0;
const joi_1 = __importDefault(require("joi"));
const errors_1 = require("../types/errors");
exports.validators = {
    wxUser: joi_1.default.object({
        openId: joi_1.default.string().required(),
        unionId: joi_1.default.string().allow(null),
        sessionKey: joi_1.default.string().allow(null),
        nickName: joi_1.default.string().max(100).allow(null),
        avatarUrl: joi_1.default.string().uri().allow(null)
    }),
    message: joi_1.default.object({
        conversationId: joi_1.default.string().required(),
        content: joi_1.default.string().required(),
        role: joi_1.default.string().valid('user', 'assistant').required()
    }),
    chatSession: joi_1.default.object({
        openId: joi_1.default.string().required(),
        title: joi_1.default.string().max(255).allow(null)
    })
};
const validate = (schema, data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield schema.validateAsync(data, { abortEarly: false });
    }
    catch (error) {
        if (error instanceof joi_1.default.ValidationError) {
            throw new errors_1.ValidationError('数据验证失败', error.details);
        }
        throw error;
    }
});
exports.validate = validate;
