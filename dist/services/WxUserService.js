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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WxUserService = void 0;
const WxUserModel_1 = require("../models/WxUserModel");
class WxUserService {
    constructor() {
        this.userModel = new WxUserModel_1.WxUserModel();
    }
    loginUser(openId, avatarUrl = '', phone) {
        return __awaiter(this, void 0, void 0, function* () {
            let user = yield this.userModel.findByOpenId(openId);
            if (!user) {
                user = yield this.userModel.create({
                    openId: openId, avatarUrl, phone
                });
            }
            else {
                // await this.userModel.updateLastLogin(wxLoginData.openId);
            }
            return true;
        });
    }
    findUserByOpenId(openId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.userModel.findByOpenId(openId);
        });
    }
    static getInstance() {
        if (!this.ins) {
            this.ins = new WxUserService();
        }
        return this.ins;
    }
}
exports.WxUserService = WxUserService;
WxUserService.ins = null;
